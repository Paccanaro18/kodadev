// Roda de verdade os exemplos de código dos módulos das trilhas e compara com a saída que o texto mostra.
//
//   node scripts/verificar-exemplos.mjs              verifica tudo
//   node scripts/verificar-exemplos.mjs java         só uma trilha (java, typescript ou python)
//
// Convenção nos módulos:
//   - um bloco de código cuja legenda termina em .java, .ts ou .py é um programa completo e é executado;
//   - um bloco cuja legenda termina em .json precisa ser um JSON válido (por exemplo, as políticas do IAM);
//   - se o bloco seguinte tiver a legenda "Saída", a saída do programa precisa ser igual a ele;
//   - programas .ts também precisam passar na checagem de tipos do TypeScript em modo estrito;
//   - uma legenda terminada em .erro.ts marca um exemplo que o compilador TypeScript precisa recusar, e o bloco
//     seguinte, com a legenda "Erro do compilador", traz um trecho da mensagem que o tsc deve emitir;
//   - qualquer outra legenda (ou nenhuma) é um trecho de ilustração e não é executado.
// Precisa de Java 21+ (JAVA_HOME ou java no PATH), Node 22.18+ e Python 3.

import { mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const RAIZ = new URL("../lib/trilhas/", import.meta.url);
const TSC = fileURLToPath(new URL("../node_modules/typescript/bin/tsc", import.meta.url));
const TIPOS = fileURLToPath(new URL("../node_modules/@types", import.meta.url));

function comando(extensao, arquivo) {
  if (extensao === ".java") {
    const java = process.env.JAVA_HOME ? join(process.env.JAVA_HOME, "bin", "java") : "java";
    return [java, ["-Dfile.encoding=UTF-8", "-Dstdout.encoding=UTF-8", arquivo]];
  }
  if (extensao === ".ts") return [process.execPath, [arquivo]];
  return [process.env.PYTHON ?? "python", [arquivo]];
}

/** Confere os tipos do arquivo no modo estrito, como um projeto TypeScript de verdade faria. */
function conferirTipos(arquivo) {
  return spawnSync(
    process.execPath,
    [
      TSC, "--noEmit", "--strict", "--target", "es2022", "--module", "nodenext", "--moduleResolution", "nodenext",
      "--skipLibCheck", "--typeRoots", TIPOS, "--types", "node", arquivo,
    ],
    { encoding: "utf8", timeout: 120000 },
  );
}

function normalizar(texto) {
  return texto.replace(/\r\n/g, "\n").trimEnd();
}

async function modulosDe(pasta) {
  const arquivos = readdirSync(new URL(`${pasta}/`, RAIZ)).filter((nome) => /^modulo-.*\.ts$/.test(nome));
  const modulos = [];
  for (const arquivo of arquivos) {
    const caminho = fileURLToPath(new URL(`${pasta}/${arquivo}`, RAIZ));
    const carregado = await import(pathToFileURL(caminho).href);
    modulos.push(...Object.values(carregado).filter((valor) => valor && valor.tipo === "modulo"));
  }
  return modulos;
}

function primeirasLinhas(texto, quantas = 8) {
  return texto.split("\n").slice(0, quantas).join("\n");
}

const filtro = process.argv[2];
const pastas = ["java", "typescript", "python", "aws", "llm"].filter((pasta) => !filtro || pasta === filtro);
const temporario = mkdtempSync(join(tmpdir(), "koda-exemplos-"));
let total = 0;
let comparadas = 0;
const falhas = [];

for (const pasta of pastas) {
  for (const modulo of await modulosDe(pasta)) {
    const blocos = modulo.blocos;
    blocos.forEach((bloco, indice) => {
      if (bloco.tipo !== "codigo" || !bloco.legenda) return;
      const extensao = /\.(java|ts|py|json)$/.exec(bloco.legenda)?.[0];
      if (!extensao) return;

      if (extensao === ".json") {
        total += 1;
        try {
          JSON.parse(bloco.texto);
        } catch (erro) {
          falhas.push(`${pasta}/${modulo.slug} · ${bloco.legenda}: JSON inválido (${erro.message})`);
        }
        return;
      }

      total += 1;
      const nomeSeguro = bloco.legenda.replace(/[^A-Za-z0-9_.-]/g, "_");
      const arquivo = join(temporario, `${pasta}-${modulo.slug}-${indice}-${nomeSeguro}`);
      writeFileSync(arquivo, bloco.texto, "utf8");
      const nome = `${pasta}/${modulo.slug} · ${bloco.legenda}`;
      const proximo = blocos[indice + 1];

      if (bloco.legenda.endsWith(".erro.ts")) {
        const tipos = conferirTipos(arquivo);
        if (tipos.status === 0) {
          falhas.push(`${nome}: devia ser recusado pelo compilador, mas passou`);
        } else if (proximo?.tipo === "codigo" && proximo.legenda === "Erro do compilador") {
          comparadas += 1;
          if (!(tipos.stdout + tipos.stderr).includes(proximo.texto.trim())) {
            falhas.push(`${nome}: a mensagem do compilador é diferente do texto\n--- esperado (trecho) ---\n${proximo.texto.trim()}\n--- obtido ---\n${primeirasLinhas(tipos.stdout)}`);
          }
        }
        return;
      }

      if (extensao === ".ts") {
        const tipos = conferirTipos(arquivo);
        if (tipos.status !== 0) {
          falhas.push(`${nome}: erro de tipos\n${primeirasLinhas(tipos.stdout)}`);
          return;
        }
      }

      const [programa, argumentos] = comando(extensao, arquivo);
      const resultado = spawnSync(programa, argumentos, {
        encoding: "utf8",
        timeout: 60000,
        env: { ...process.env, PYTHONIOENCODING: "utf-8", PYTHONUTF8: "1" },
      });

      if (resultado.error || resultado.status !== 0) {
        falhas.push(`${nome}: não executou (status ${resultado.status})\n${primeirasLinhas(resultado.stderr || String(resultado.error))}`);
        return;
      }
      if (proximo?.tipo === "codigo" && proximo.legenda === "Saída") {
        comparadas += 1;
        const obtido = normalizar(resultado.stdout);
        const esperado = normalizar(proximo.texto);
        if (obtido !== esperado) {
          falhas.push(`${nome}: a saída é diferente do texto\n--- esperado ---\n${esperado}\n--- obtido ---\n${obtido}`);
        }
      }
    });
  }
}

rmSync(temporario, { recursive: true, force: true });
console.log(`${total} programa(s) executado(s), ${comparadas} verificação(ões) de saída ou de erro, ${falhas.length} falha(s).`);
for (const falha of falhas) console.log(`\nFALHOU: ${falha}`);
process.exit(falhas.length === 0 ? 0 : 1);
