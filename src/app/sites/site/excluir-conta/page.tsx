import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/site/legal-page";
import { loadPublicConfig, type PublicConfig } from "@/lib/public-api";

// Renderiza a cada visita: o e-mail de suporte vem das Configurações do painel.
export const dynamic = "force-dynamic";

const TITLE = "Como excluir sua conta";
const DESCRIPTION = "Passo a passo para excluir sua conta e seus dados do ToSave, pelo app ou pelo site.";
const UPDATED_AT = "1 de outubro de 2026";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/excluir-conta" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/excluir-conta" },
};

async function loadSupportEmail(): Promise<string> {
  try {
    const config = await loadPublicConfig({ revalidate: 0 });
    return (config as PublicConfig).supportEmail || "";
  } catch {
    return "";
  }
}

export default async function ExcluirContaPage() {
  const supportEmail = await loadSupportEmail();
  const sections = buildSections(supportEmail);

  return (
    <LegalPage
      title={TITLE}
      updatedAt={UPDATED_AT}
      intro={
        <p>
          Esta página explica como excluir sua conta do ToSave e o que acontece com seus dados. A exclusão é feita
          por você mesmo, diretamente pelo aplicativo ou pelo site, sem precisar entrar em contato com o suporte.
        </p>
      }
      sections={sections}
    />
  );
}

function buildSections(supportEmail: string): LegalSection[] {
  return [
    {
      id: "pelo-app",
      title: "1. Pelo aplicativo (Android ou iPhone)",
      body: (
        <ol className="list-decimal space-y-1.5 pl-5">
          <li>Abra o app ToSave e entre na sua conta.</li>
          <li>
            Na barra inferior, toque em <strong>Mais</strong>.
          </li>
          <li>
            Toque em <strong>Perfil</strong>.
          </li>
          <li>
            Role até o final e toque em <strong>Excluir conta</strong>.
          </li>
          <li>Leia o aviso sobre o que será apagado, digite sua senha atual e confirme.</li>
        </ol>
      ),
    },
    {
      id: "pelo-site",
      title: "2. Pelo site (app.tosave.cloud)",
      body: (
        <ol className="list-decimal space-y-1.5 pl-5">
          <li>
            Acesse <strong>app.tosave.cloud</strong> e entre na sua conta.
          </li>
          <li>
            Abra o menu <strong>Mais</strong> e toque em <strong>Perfil</strong>.
          </li>
          <li>
            Role até o final e clique em <strong>Excluir conta</strong>.
          </li>
          <li>Leia o aviso, digite sua senha atual e confirme.</li>
        </ol>
      ),
    },
    {
      id: "o-que-e-apagado",
      title: "3. O que é apagado",
      body: (
        <>
          <p>A exclusão é imediata e definitiva. São apagados:</p>
          <ul>
            <li>sua conta de login (e-mail, senha e telefone);</li>
            <li>toda a sua coleção de miniaturas;</li>
            <li>suas notificações;</li>
            <li>seus anúncios no Clube da Troca.</li>
          </ul>
          <p>Todas as sessões ativas (celular, site) são encerradas no mesmo momento.</p>
        </>
      ),
    },
    {
      id: "o-que-nao-e-apagado",
      title: "4. O que não é apagado",
      body: (
        <p>
          Se você publicou alguma notícia como administrador, ela continua visível, sem o seu nome associado. Se um
          anúncio seu no Clube da Troca já tinha sido removido antes da exclusão, isso não muda nada.
        </p>
      ),
    },
    {
      id: "nao-consigo-excluir",
      title: "5. Não consigo excluir pelo app ou pelo site",
      body: supportEmail ? (
        <p>
          Se o app ou o site não abrirem para você, ou se a senha estiver indisponível, escreva para{" "}
          <a href={`mailto:${supportEmail}`}>{supportEmail}</a> pedindo a exclusão da sua conta, a partir do mesmo
          e-mail cadastrado no ToSave. O pedido é atendido em até 7 dias.
        </p>
      ) : (
        <p>
          Se o app ou o site não abrirem para você, escreva para o e-mail de suporte do ToSave pedindo a exclusão da
          sua conta, a partir do mesmo e-mail cadastrado.
        </p>
      ),
    },
  ];
}
