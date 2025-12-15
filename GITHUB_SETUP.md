# Configuração do Repositório GitHub

## Opção 1: Usar o Script Automático

1. Crie um Personal Access Token no GitHub:
   - Acesse: https://github.com/settings/tokens
   - Clique em "Generate new token (classic)"
   - Dê um nome (ex: "SchoolPool Repo")
   - Selecione o escopo `repo` (acesso completo a repositórios)
   - Clique em "Generate token"
   - **Copie o token** (você só verá ele uma vez!)

2. Execute o script:
```powershell
.\create-repo.ps1 -GitHubToken "seu_token_aqui"
```

## Opção 2: Criar Manualmente

1. Acesse https://github.com/new
2. Preencha:
   - **Repository name**: `schoolpool-smart-transport`
   - **Description**: `SchoolPool - Smart Transport Management System`
   - Escolha se será público ou privado
   - **NÃO** marque "Initialize with README" (já temos um)
3. Clique em "Create repository"

4. Execute os comandos:
```powershell
cd "C:\Users\jesse\Downloads\schoolpool_-smart-transport (2)"
git remote add origin https://github.com/jessefreitasguimaraesnegocios-app/schoolpool-smart-transport.git
git branch -M main
git push -u origin main
```

## Verificar Status

```powershell
git status
git remote -v
```

