import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/site/legal-page";
import { loadPublicConfig, type PublicConfig } from "@/lib/public-api";

// Renderiza a cada visita: o e-mail de suporte vem das Configurações do painel (o ISR não renovava no container).
export const dynamic = "force-dynamic";

const TITLE = "Política de Privacidade";
const DESCRIPTION = "Como o ToSave coleta, usa e protege os seus dados no site, no app e no Clube da Troca.";
const UPDATED_AT = "28 de setembro de 2026";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/privacidade" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/privacidade" },
};

async function loadSupportEmail(): Promise<string> {
  try {
    const config = await loadPublicConfig({ revalidate: 0 });
    return (config as PublicConfig).supportEmail || "";
  } catch {
    return "";
  }
}

export default async function PrivacidadePage() {
  const supportEmail = await loadSupportEmail();
  const sections = buildSections(supportEmail);

  return (
    <LegalPage
      title={TITLE}
      updatedAt={UPDATED_AT}
      intro={
        <p>
          Esta Política de Privacidade explica quais dados o ToSave coleta, para que eles servem e como você pode
          controlá-los, no site (<strong>tosave.cloud</strong>), no app do colecionador (<strong>app.tosave.cloud</strong>) e
          no aplicativo para celular. Ao criar uma conta ou usar o ToSave, você concorda com o que está descrito aqui.
        </p>
      }
      sections={sections}
    />
  );
}

function buildSections(supportEmail: string): LegalSection[] {
  return [
    {
      id: "definicoes",
      title: "1. Definições",
      body: (
        <ul>
          <li>
            <strong>Conta:</strong> o cadastro único que você cria para acessar o ToSave.
          </li>
          <li>
            <strong>ToSave</strong> (também &quot;nós&quot; ou &quot;nossa&quot;): o serviço — site, app do colecionador e aplicativo para
            celular — mantido pela equipe do ToSave.
          </li>
          <li>
            <strong>Dispositivo:</strong> qualquer aparelho usado para acessar o ToSave, como computador, celular ou
            tablet.
          </li>
          <li>
            <strong>Dados Pessoais:</strong> qualquer informação relacionada a uma pessoa identificada ou identificável.
          </li>
          <li>
            <strong>Provedor de Serviços:</strong> empresas que processam dados em nosso nome para que o ToSave funcione
            — por exemplo, hospedagem e autenticação.
          </li>
          <li>
            <strong>Dados de Uso:</strong> dados coletados automaticamente pelo uso do serviço (por exemplo, a duração de
            uma visita a uma página).
          </li>
          <li>
            <strong>Usuário / Você:</strong> a pessoa que acessa ou usa o ToSave.
          </li>
        </ul>
      ),
    },
    {
      id: "dados-que-coletamos",
      title: "2. Dados que coletamos",
      body: (
        <>
          <p>
            <strong>Dados que você nos fornece:</strong>
          </p>
          <ul>
            <li>Nome e e-mail, no cadastro da sua conta.</li>
            <li>
              Telefone de contato — <strong>opcional</strong>. Você pode cadastrá-lo no seu perfil; ele é usado só no
              Clube da Troca (veja a seção 4).
            </li>
            <li>Dados da sua coleção: quais miniaturas você marcou como possuídas e em que quantidade.</li>
            <li>
              Anúncios do Clube da Troca: quando você anuncia uma miniatura para troca ou venda, guardamos o carro
              anunciado, o tipo (troca ou venda), o preço quando informado, a descrição e os carros que você deseja
              receber em troca.
            </li>
            <li>
              Token de notificação push: se você permitir notificações no app, guardamos um identificador do seu
              aparelho (Expo Push Token) para poder te enviar avisos.
            </li>
          </ul>
          <p className="mt-4">
            <strong>Dados coletados automaticamente:</strong>
          </p>
          <ul>
            <li>
              Endereço IP, tipo e versão do navegador ou do sistema do celular, páginas acessadas, data e hora de
              acesso, identificadores únicos do dispositivo e outros dados de diagnóstico.
            </li>
          </ul>
          <p className="mt-4">
            O ToSave usa apenas cookies técnicos, necessários para o funcionamento do site (por exemplo, para lembrar
            se você prefere o tema claro ou escuro) — nenhum cookie de rastreamento ou publicidade.
          </p>
        </>
      ),
    },
    {
      id: "uso-dos-dados",
      title: "3. Como usamos seus dados",
      body: (
        <ul>
          <li>Fornecer e manter o serviço, incluindo sua coleção, o catálogo e o Clube da Troca.</li>
          <li>Gerenciar sua conta e a sua autenticação.</li>
          <li>
            Contatar você por e-mail ou notificação push sobre novidades, avisos e atividade da sua conta — as
            notificações push são sempre opcionais (veja a seção 6).
          </li>
          <li>Entender como o ToSave é usado, para corrigir problemas e melhorar o serviço.</li>
          <li>Cumprir obrigações legais e proteger os direitos do ToSave e dos usuários.</li>
        </ul>
      ),
    },
    {
      id: "clube-da-troca",
      title: '4. Clube da Troca e o botão "Revelar contato"',
      body: (
        <ul>
          <li>No Clube da Troca você anuncia a troca ou venda de uma miniatura da própria coleção para outros colecionadores.</li>
          <li>
            O seu telefone <strong>nunca</strong> aparece na listagem nem no detalhe do anúncio.
          </li>
          <li>
            Ele só é mostrado a outro colecionador logado quando esse colecionador toca no botão{" "}
            <strong>&quot;Revelar contato&quot;</strong> dentro do seu anúncio — e você recebe uma notificação avisando
            do interesse.
          </li>
          <li>Se você não tiver telefone cadastrado no perfil, o botão &quot;Revelar contato&quot; simplesmente não aparece para os outros usuários.</li>
        </ul>
      ),
    },
    {
      id: "compartilhamento",
      title: "5. Com quem compartilhamos seus dados",
      body: (
        <ul>
          <li>
            <strong>Provedores de serviço:</strong> usamos o Appwrite para autenticação (login) e para guardar imagens
            (fotos de miniaturas, séries e marcas), hospedado no mesmo servidor do ToSave.
          </li>
          <li>
            <strong>Outros usuários:</strong> seu nome aparece nos seus anúncios do Clube da Troca; seu telefone só
            aparece para quem tocar em &quot;Revelar contato&quot; (seção 4).
          </li>
          <li>
            <strong>Autoridades:</strong> podemos divulgar dados quando exigido por lei ou ordem judicial, ou para
            proteger os direitos e a segurança do ToSave e de seus usuários.
          </li>
          <li>Nunca vendemos seus dados pessoais a terceiros.</li>
        </ul>
      ),
    },
    {
      id: "hospedagem",
      title: "6. Hospedagem e segurança",
      body: (
        <p>
          O ToSave roda em um servidor próprio, hospedado na Hostinger. A autenticação de conta e o armazenamento de
          imagens usam o Appwrite, instalado no mesmo servidor. Usamos medidas técnicas razoáveis para proteger seus
          dados, mas nenhum método de transmissão pela internet ou de armazenamento eletrônico é 100% seguro.
        </p>
      ),
    },
    {
      id: "retencao",
      title: "7. Por quanto tempo guardamos seus dados",
      body: (
        <p>
          Guardamos seus dados pessoais enquanto sua conta existir. Ao excluir a conta (seção 8), apagamos seus dados
          pessoais e os dados ligados a ela, exceto quando a lei exigir que guardemos alguma informação por mais tempo
          (por exemplo, para cumprir obrigações legais ou resolver disputas).
        </p>
      ),
    },
    {
      id: "exclusao-de-conta",
      title: "8. Exclusão da sua conta",
      body: (
        <>
          <p>
            Você pode excluir sua conta a qualquer momento, direto pelo app, em <strong>Perfil → Excluir conta</strong>,
            confirmando com sua senha.
          </p>
          <p>
            Ao excluir, apagamos sua coleção, os tokens de notificação, os anúncios do Clube da Troca (e os carros
            desejados neles) e as notificações endereçadas a você, além da sua conta. Avisos que você enviou como
            administrador continuam visíveis, sem o seu nome.
          </p>
        </>
      ),
    },
    {
      id: "notificacoes",
      title: "9. Notificações",
      body: (
        <p>
          As notificações push são opcionais: você decide se quer permiti-las ao instalar o app, e pode desativá-las a
          qualquer momento nas configurações do seu aparelho ou do próprio app. Sem essa permissão, o ToSave não te
          envia notificações.
        </p>
      ),
    },
    {
      id: "criancas-e-adolescentes",
      title: "10. Privacidade de crianças e adolescentes",
      body: (
        <p>
          O ToSave não é direcionado a, e não coleta intencionalmente dados pessoais de, menores de 16 anos. Se você é
          pai, mãe ou responsável e acredita que seu filho nos forneceu dados pessoais, entre em contato conosco (seção
          13). Se tomarmos conhecimento de que coletamos dados de um menor de 16 anos sem o consentimento devido,
          tomaremos providências para remover essa informação dos nossos servidores.
        </p>
      ),
    },
    {
      id: "seus-direitos",
      title: "11. Seus direitos",
      body: (
        <p>
          Você pode acessar, corrigir ou excluir seus dados pessoais a qualquer momento — o nome e o telefone direto no
          seu perfil, e a conta inteira pela exclusão de conta (seção 8). Você também pode nos contatar para exercer
          outros direitos previstos na Lei Geral de Proteção de Dados (LGPD), como a portabilidade dos seus dados ou a
          revogação de um consentimento.
        </p>
      ),
    },
    {
      id: "alteracoes",
      title: "12. Alterações a esta Política",
      body: (
        <p>
          Podemos atualizar esta Política de Privacidade de tempos em tempos. Vamos avisar sobre mudanças relevantes
          pelo app ou pelo site, e atualizar a data de &quot;Última atualização&quot; no topo desta página. Recomendamos revisar
          esta página periodicamente.
        </p>
      ),
    },
    {
      id: "contato",
      title: "13. Fale conosco",
      body: supportEmail ? (
        <p>
          Se você tiver dúvidas sobre esta Política de Privacidade, entre em contato pelo e-mail{" "}
          <a href={`mailto:${supportEmail}`}>{supportEmail}</a>.
        </p>
      ) : (
        <p>
          Se você tiver dúvidas sobre esta Política de Privacidade, entre em contato conosco pelo e-mail de suporte
          informado no app.
        </p>
      ),
    },
  ];
}
