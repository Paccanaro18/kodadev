import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import Ferramentas from "./Ferramentas";

vi.mock("../AppShell", () => ({ default: ({ children }: { children: ReactNode }) => <div>{children}</div> }));

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

describe("Ferramentas", () => {
  it("calcula a sub-rede e divide a rede", async () => {
    render(<Ferramentas />);
    const usuario = userEvent.setup();
    expect(screen.getByText("192.168.1.64/26")).toBeInTheDocument();
    expect(screen.getByText("192.168.1.126")).toBeInTheDocument();
    expect(screen.getByText("62")).toBeInTheDocument();

    const campo = screen.getByLabelText("Endereço com prefixo ou máscara");
    await usuario.clear(campo);
    await usuario.type(campo, "10.0.0.1/33");
    expect(screen.getByRole("alert")).toHaveTextContent("0 a 32");

    await usuario.clear(campo);
    await usuario.type(campo, "192.168.0.0/24");
    await usuario.type(screen.getByLabelText(/Dividir em sub-redes/), "26");
    expect(screen.getByText("192.168.0.192/26")).toBeInTheDocument();
  });

  it("converte entre bases", async () => {
    render(<Ferramentas />);
    const usuario = userEvent.setup();
    await usuario.click(screen.getByRole("tab", { name: /Bases numéricas/ }));
    expect(screen.getByText("1100 0000")).toBeInTheDocument();
    expect(screen.getByText("C0")).toBeInTheDocument();
    await usuario.click(screen.getByRole("button", { name: "Binário" }));
    expect(screen.getByRole("alert")).toHaveTextContent("não é um número binário");
  });

  it("decodifica um JWT, mostra os avisos e recusa token inválido", async () => {
    render(<Ferramentas />);
    const usuario = userEvent.setup();
    await usuario.click(screen.getByRole("tab", { name: /JWT/ }));
    expect(screen.getByText(/o token não é enviado a nenhum servidor/)).toBeInTheDocument();

    await usuario.click(screen.getByLabelText("Token JWT"));
    await usuario.paste(TOKEN);
    expect(screen.getByText(/"name": "John Doe"/)).toBeInTheDocument();
    expect(screen.getByText("2018-01-18T01:30:22.000Z")).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Avisos de segurança" })).toHaveTextContent("não tem expiração");

    await usuario.clear(screen.getByLabelText("Token JWT"));
    await usuario.type(screen.getByLabelText("Token JWT"), "abc");
    expect(screen.getByRole("alert")).toHaveTextContent("três partes");
  });

  it("gera o hash e converte Base64", async () => {
    render(<Ferramentas />);
    const usuario = userEvent.setup();
    await usuario.click(screen.getByRole("tab", { name: /Hash e Base64/ }));
    await waitFor(() => expect(screen.getByLabelText("Hash SHA-256")).toHaveTextContent(/^[0-9a-f]{64}$/));
    expect(screen.getByLabelText("Texto em Base64")).toHaveValue("a29kYQ==");
    expect(screen.getByLabelText("Texto decodificado")).toHaveTextContent("koda");

    await usuario.click(screen.getByRole("button", { name: "SHA-1" }));
    expect(screen.getByText(/Quebrado para assinaturas/)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByLabelText("Hash SHA-1")).toHaveTextContent(/^[0-9a-f]{40}$/));

    await usuario.click(screen.getByLabelText(/Variante segura para URL/));
    expect(screen.getByLabelText("Texto em Base64")).toHaveValue("a29kYQ");
    await usuario.clear(screen.getByLabelText("Decodificar"));
    await usuario.type(screen.getByLabelText("Decodificar"), "***");
    expect(screen.getByRole("alert")).toHaveTextContent("não é Base64 válido");
  });
});
