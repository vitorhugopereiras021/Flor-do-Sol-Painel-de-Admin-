let listaProdutos = [];
const apiFetchUrl = '../api/produtos.php';
const apiAdminUrl = '../api/admin_produtos.php';
const tokenAdmin = localStorage.getItem('flordosol-token');
const usuarioAdmin = JSON.parse(localStorage.getItem('flordosol-user') || '{}');

if (!tokenAdmin || usuarioAdmin.cargo !== 'admin') {
    // Se não for admin cadastrado, joga o invasor direto de volta para a home da loja
    window.location.href = '../index.html'; 
}

// Carregar lista ao iniciar a página
document.addEventListener("DOMContentLoaded", buscarProdutos);

async function buscarProdutos() {
  try {
    const res = await fetch(apiFetchUrl);
    if (res.ok) {
      listaProdutos = await res.json();
      renderizarTabela();
    }
  } catch (err) {
    alert("Erro ao conectar com a API de produtos.");
  }
}

function renderizarTabela() {
  const tbody = document.getElementById("tabela-produtos");
  if (!tbody) return;

  tbody.innerHTML = listaProdutos.map(p => `
    <tr class="hover:bg-gray-50/80 transition">
      <td class="p-4">
        <img src="../${p.imagem}" alt="${p.nome}" class="w-12 h-12 object-cover rounded-lg border">
      </td>
      <td class="p-4 font-medium text-gray-900">${p.nome}</td>
      <td class="p-4 text-gray-500 capitalize">${p.categoria}</td>
      <td class="p-4 font-semibold">R$ ${parseFloat(p.preco).toFixed(2)}</td>
      <td class="p-4">
        ${p.badge ? `<span class="px-2 py-0.5 text-xs text-white rounded bg-[#aea100]">${p.badge}</span>` : '<span class="text-gray-300">—</span>'}
      </td>
      <td class="p-4 text-right space-x-2">
        <button onclick="abrirModalEdicao(${p.id})" class="text-[#aea100] hover:underline font-medium">Editar</button>
        <button onclick="excluirProduto(${p.id})" class="text-red-600 hover:underline font-medium">Excluir</button>
      </td>
    </tr>
  `).join("");
}

// Controle de Modais
const modal = document.getElementById("modal-form");
const form = document.getElementById("produto-form");

function abrirModalEdicao(id) {
  const p = listaProdutos.find(item => item.id === id);
  if (!p) return;

  document.getElementById("prod-id").value = p.id;
  document.getElementById("prod-nome").value = p.nome;
  document.getElementById("prod-preco").value = p.preco;
  document.getElementById("prod-categoria").value = p.categoria;
  document.getElementById("prod-badge").value = p.badge || "";
  
  // Guarda o caminho atual caso o admin não queira trocar de imagem nesta edição
  document.getElementById("prod-imagem-atual").value = p.imagem;
  const txtImagem = document.getElementById("nome-imagem-atual");
  if (txtImagem) {
    txtImagem.innerText = `Imagem atual: ${p.imagem.split('/').pop()}`;
    txtImagem.classList.remove("hidden");
  }

  document.getElementById("prod-tamanho").value = p.tamanho || "";
  document.getElementById("prod-embalagem").value = p.embalagem || "";
  document.getElementById("prod-rega").value = p.rega || "";
  document.getElementById("prod-sol").value = p.sol || "";
  document.getElementById("prod-umidade").value = p.umidade || "";

  document.getElementById("modal-titulo").innerText = "Editar Produto";
  modal.classList.remove("hidden");
}

function abrirModalCadastro() {
  form.reset();
  document.getElementById("prod-id").value = "";
  document.getElementById("prod-imagem-atual").value = "";
  const txtImagem = document.getElementById("nome-imagem-atual");
  if (txtImagem) txtImagem.classList.add("hidden");
  
  document.getElementById("modal-titulo").innerText = "Cadastrar Novo Produto";
  modal.classList.remove("hidden");
}

function fecharModalForm() {
  modal.classList.add("hidden");
}

// Salvar (POST ou PUT)
async function salvarProduto(event) {
  event.preventDefault();

  const id = document.getElementById("prod-id").value;
  const inputFile = document.getElementById("prod-imagem-file");
  const imagemAtual = document.getElementById("prod-imagem-atual").value;

  // Quando enviamos arquivos, usamos FormData em vez de JSON stringify
  const formData = new FormData();
  
  if (id !== "") formData.append('id', parseInt(id));
  formData.append('nome', document.getElementById("prod-nome").value);
  formData.append('preco', parseFloat(document.getElementById("prod-preco").value));
  formData.append('categoria', document.getElementById("prod-categoria").value);
  formData.append('badge', document.getElementById("prod-badge").value || '');
  formData.append('tamanho', document.getElementById("prod-tamanho").value || '');
  formData.append('embalagem', document.getElementById("prod-embalagem").value || '');
  formData.append('rega', document.getElementById("prod-rega").value || '');
  formData.append('sol', document.getElementById("prod-sol").value || '');
  formData.append('umidade', document.getElementById("prod-umidade").value || '');

  // Verifica se um novo arquivo foi selecionado
  if (inputFile.files.length > 0) {
    formData.append('imagem_upload', inputFile.files[0]);
  } else if (id !== "") {
    // Se for edição e não enviou foto nova, mantém a atual
    formData.append('imagem_atual', imagemAtual);
  } else {
    alert("Por favor, selecione uma imagem para o novo produto.");
    return;
  }

  const isEdicao = id !== "";

  try {
    const response = await fetch(apiAdminUrl, {
      method: 'POST', // DICA: Muitos servidores limitam upload de arquivos via PUT, use POST para ambos
      headers: { 
        // Importante: NÃO adicione 'Content-Type' aqui. O próprio navegador define o boundary correto para FormData
        'Authorization': `Bearer ${tokenAdmin}` 
      },
      body: formData
    });

    const resultado = await response.json();
    if (response.ok) {
      alert(resultado.sucesso);
      fecharModalForm();
      buscarProdutos();
    } else {
      alert("Erro: " + resultado.erro);
    }
  } catch (err) {
    alert("Não foi possível salvar o produto.");
  }
}

// Excluir (DELETE)
async function excluirProduto(id) {
  if (!confirm("Tem certeza que deseja remover este produto permanentemente?")) return;

  try {
    const response = await fetch(`${apiAdminUrl}?id=${id}`, { method: 'DELETE' });
    const resultado = await response.json();

    if (response.ok) {
      alert(resultado.sucesso);
      buscarProdutos();
    } else {
      alert("Erro: " + resultado.erro);
    }
  } catch (err) {
    alert("Não foi possível excluir o produto.");
  }
}