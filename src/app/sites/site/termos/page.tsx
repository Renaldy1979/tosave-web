import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/site/legal-page";
import { loadPublicConfig, type PublicConfig } from "@/lib/public-api";

const TITLE = "Termos de Uso";
const DESCRIPTION = "As regras de uso do ToSave: conta, coleção, Clube da Troca e conteúdo do usuário.";
const UPDATED_AT = "28 de setembro de 2026";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/termos" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/termos" },
};

async function loadSupportEmail(): Promise<string> {
  try {
    const config = await loadPublicConfig({ revalidate: 300 });
    return (config as PublicConfig).supportEmail || "";
  } catch {
    return "";
  }
}

export default async function TermosPage() {
  const supportEmail = await loadSupportEmail();
  const sections = buildSections(supportEmail);

  return (
    <LegalPage
      title={TITLE}
      updatedAt={UPDATED_AT}
      intro={
        <>
          <p>
            Seja bem-vindo ao ToSave, a comunidade de colecionadores de miniaturas em escala 1:64 (Hot Wheels,
            Matchbox e afins). O ToSave é oferecido por{" "}
            <strong>[A DEFINIR: razão social ou nome do responsável]</strong> (
            <strong>[A DEFINIR: CNPJ ou CPF]</strong>), doravante &quot;ToSave&quot;, nos endereços{" "}
            <strong>tosave.cloud</strong> e <strong>app.tosave.cloud</strong>, e pelo aplicativo para celular.
          </p>
          <p>
            Ao criar uma conta ou usar o ToSave de qualquer forma, você concorda com todas as cláusulas abaixo. Se você
            não concordar com algum termo, não use o serviço.
          </p>
        </>
      }
      sections={sections}
    />
  );
}

function buildSections(supportEmail: string): LegalSection[] {
  return [
    {
      id: "funcao-do-servico",
      title: "1. Da função do ToSave",
      body: (
        <p>
          O ToSave é uma comunidade de colecionadores: pelo app e pelo site você monta a sua garagem digital
          (coleção), navega pelo catálogo de miniaturas por marca, série e ano, e participa do Clube da Troca. O
          conteúdo do catálogo é mantido pela equipe do ToSave e atualizado periodicamente; ainda assim, alguma
          informação (como cor, código ou ano de uma miniatura) pode estar desatualizada ou incompleta — o ToSave não
          se responsabiliza por decisões tomadas com base nela.
        </p>
      ),
    },
    {
      id: "aceite-dos-termos",
      title: "2. Do aceite dos termos",
      body: (
        <p>
          Este documento estabelece direitos e obrigações entre o ToSave e você. Ao criar uma conta ou continuar
          usando o ToSave, você declara que leu, entendeu e concorda com todas as cláusulas aqui. Este termo pode ser
          atualizado periodicamente; recomendamos conferir a data de &quot;Última atualização&quot; no topo desta página de tempos
          em tempos.
        </p>
      ),
    },
    {
      id: "glossario",
      title: "3. Do glossário",
      body: (
        <ul>
          <li>
            <strong>USUÁRIO:</strong> qualquer pessoa que acesse o ToSave, por computador, celular, tablet ou outro
            meio.
          </li>
          <li>
            <strong>CONTA:</strong> o cadastro que dá acesso às funções do ToSave.
          </li>
          <li>
            <strong>COLEÇÃO:</strong> o conjunto de miniaturas que um usuário marca como possuídas no ToSave.
          </li>
          <li>
            <strong>CLUBE DA TROCA:</strong> a área do ToSave onde usuários anunciam miniaturas da própria coleção para
            troca ou venda com outros usuários.
          </li>
          <li>
            <strong>HIPERLINKS:</strong> links clicáveis que levam a outra página do ToSave ou a um site externo.
          </li>
          <li>
            <strong>OFFLINE:</strong> quando o ToSave está indisponível, sem poder ser acessado.
          </li>
        </ul>
      ),
    },
    {
      id: "acesso",
      title: "4. Do acesso ao app e ao site",
      body: (
        <>
          <p>
            O ToSave funciona normalmente 24 horas por dia, mas pode ter interrupções temporárias para manutenção,
            ajustes, mudança de servidores ou falhas técnicas. O ToSave não se responsabiliza por perdas ou prejuízos
            causados por essa indisponibilidade temporária.
          </p>
          <p>
            O acesso ao ToSave é permitido a maiores de 18 anos ou a quem tenha capacidade civil plena. Para o acesso
            de menores de idade, é necessária a autorização expressa dos pais ou responsáveis, que ficam responsáveis
            por qualquer uso feito pelo menor.
          </p>
          <p>
            O cadastro exige nome e e-mail válidos. O tratamento dos seus dados segue a Lei Geral de Proteção de Dados
            e a nossa{" "}
            <a href="/privacidade">Política de Privacidade</a>.
          </p>
        </>
      ),
    },
    {
      id: "licenca-de-uso",
      title: "5. Da licença de uso e cópia",
      body: (
        <p>
          O usuário pode acessar o conteúdo do ToSave — catálogo, imagens, textos e demais materiais — para uso
          pessoal e não comercial. Isso não significa nenhuma cessão de direito, permissão de cópia ou de uso comercial
          desse conteúdo. Todos os direitos autorais sobre o conteúdo do ToSave são reservados, conforme a legislação
          brasileira (Lei nº 9.610/98 e Código Civil), e seu uso, cópia ou revenda sem autorização expressa e por
          escrito do ToSave não é permitido.
        </p>
      ),
    },
    {
      id: "conteudo-do-usuario",
      title: "6. Do conteúdo do usuário",
      body: (
        <ul>
          <li>
            Você é o único responsável pelo conteúdo que publica no ToSave — sua coleção, seus anúncios do Clube da
            Troca e outras informações que preencher.
          </li>
          <li>
            Ao publicar um anúncio no Clube da Troca, você garante que a miniatura pertence à sua própria coleção e que
            as informações do anúncio (tipo, preço, descrição) são verdadeiras.
          </li>
          <li>
            O ToSave pode remover, a critério da moderação, qualquer conteúdo ou anúncio que seja abusivo, enganoso,
            falso ou que viole estes Termos ou a lei.
          </li>
        </ul>
      ),
    },
    {
      id: "clube-da-troca",
      title: "7. Do Clube da Troca",
      body: (
        <ul>
          <li>
            O Clube da Troca é um espaço para anunciar a troca ou a venda de miniaturas da própria coleção entre
            usuários — a negociação acontece diretamente entre os colecionadores, fora do ToSave.
          </li>
          <li>
            Quando o anúncio é de venda, o preço informado é <strong>só uma referência</strong>: o ToSave{" "}
            <strong>não processa pagamentos</strong> e não participa, não garante e não se responsabiliza pela
            negociação, pela entrega ou pela qualidade da miniatura negociada entre os usuários.
          </li>
          <li>
            O telefone de contato de quem anuncia só é revelado a outro usuário quando ele toca no botão &quot;Revelar
            contato&quot; no anúncio — veja detalhes na <a href="/privacidade">Política de Privacidade</a>.
          </li>
          <li>Só é possível ter um anúncio ativo por unidade da coleção; remover ou reduzir a peça da coleção cancela o anúncio correspondente.</li>
        </ul>
      ),
    },
    {
      id: "conta-e-cadastro",
      title: "8. Da conta e do cadastro",
      body: (
        <p>
          Você é responsável por manter a confidencialidade da sua senha e por toda atividade realizada na sua conta.
          Cadastros com dados falsos podem levar à suspensão ou exclusão da conta. Você pode excluir sua conta a
          qualquer momento diretamente pelo app.
        </p>
      ),
    },
    {
      id: "obrigacoes",
      title: "9. Das obrigações do usuário",
      body: (
        <>
          <p>Ao usar o ToSave, você concorda em não:</p>
          <ul>
            <li>
              Tentar invadir, hackear, sobrecarregar ou prejudicar de qualquer forma a estrutura do ToSave ou de seus
              parceiros — incluindo envio de vírus, ataques de negação de serviço (DDoS) ou acesso indevido por falhas
              do sistema.
            </li>
            <li>Publicar conteúdo de spam, propaganda de concorrentes, vírus, ou material sem direito de uso.</li>
            <li>Reproduzir qualquer conteúdo do ToSave sem autorização expressa, sob pena de responder civil e criminalmente.</li>
            <li>Usar o Clube da Troca para anunciar itens que não pertencem à sua coleção, ou fornecer dados falsos em um anúncio.</li>
          </ul>
        </>
      ),
    },
    {
      id: "moderacao",
      title: "10. Da moderação e suspensão",
      body: (
        <p>
          O ToSave pode advertir, suspender ou excluir contas, anúncios ou outros conteúdos que violem estes Termos,
          sem aviso prévio quando a gravidade exigir.
        </p>
      ),
    },
    {
      id: "termos-gerais",
      title: "11. Dos termos gerais",
      body: (
        <p>
          O ToSave pode conter links para sites externos. Apesar de só criarmos links para sites de confiança, o
          ToSave não tem responsabilidade sobre o conteúdo ou as práticas desses sites externos, sendo o usuário
          responsável pelo acesso a eles. Em caso de conflito judicial entre o usuário e o ToSave, fica eleito o foro
          da comarca de <strong>[A DEFINIR: cidade do foro]</strong>, mesmo que outro seja mais privilegiado.
        </p>
      ),
    },
    {
      id: "contato",
      title: "12. Contato",
      body: supportEmail ? (
        <p>
          Dúvidas sobre estes Termos de Uso podem ser enviadas para <a href={`mailto:${supportEmail}`}>{supportEmail}</a>.
        </p>
      ) : (
        <p>
          Dúvidas sobre estes Termos de Uso podem ser enviadas pelo e-mail de suporte{" "}
          <strong>[A DEFINIR: e-mail oficial de contato]</strong>.
        </p>
      ),
    },
  ];
}
