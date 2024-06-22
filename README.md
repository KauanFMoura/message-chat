# WhatsUT: Real-Time Messaging Application

## Requisitos do Sistema

Você foi contratado para o desenvolvimento de um sistema para comunicação interpessoal chamado WhatsUT. O sistema precisa atender aos seguintes requisitos:

### 1. Autenticação Criptografada
- **Descrição**: O usuário deve estar cadastrado para utilizar o sistema, e seu acesso deve ser feito via senha.
- **Importância**: Utilizar um processo de criptografia de dados para garantir a segurança das informações do usuário.

### 2. Lista de Usuários
- **Descrição**: Após realizar o login, uma lista de usuários deve ser apresentada.
- **Funcionalidade**: Mostrar quais usuários estão atualmente logados e disponíveis para chat.

### 3. Lista de Grupos
- **Descrição**: Uma lista de grupos para chat deve ser apresentada.
- **Funcionalidade**: O usuário pode solicitar para entrar em um grupo de conversa, sendo aprovado ou não pelo criador do grupo.

### 4. Modos de Chat
- **Descrição**: O sistema deve oferecer dois modos de chat:
  - **Chat Privado**: Permite a conversação entre duas pessoas.
  - **Chat em Grupo**: Permite que várias pessoas se juntem a uma conversa. O criador do grupo pode dar permissão a outros usuários para entrada.

### 5. Envio de Arquivos
- **Descrição**: Em chats privados, um usuário pode enviar arquivos para outro usuário.

### 6. Exclusão
- **Descrição**: Um usuário pode requisitar ao servidor que outro usuário seja banido da aplicação.
- **Funcionalidade**: Banir um usuário do grupo é tarefa do administrador do grupo. Caso o administrador do grupo saia, o aplicativo deve decidir quem será o novo administrador ou se o grupo será eliminado. Essa opção pode ser ajustada no momento da criação do grupo.

### 7. Interface do Usuário
- **Descrição**: Telas intuitivas, modernas e bem elaboradas devem ser fornecidas tanto para o cliente quanto para o servidor.

### 8. Diagramas UML
- **Descrição**: Apresentar diagramas UML (atividades, colaboração, sequência) para o sistema.
- **Importância**: Pontos adicionais serão dados para chamadas de CallBack e interfaces de servidor para configuração.
