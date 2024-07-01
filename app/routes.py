import os
from flask import render_template, request, jsonify, session, redirect, url_for, send_from_directory, send_file
from app import app, socketio, services, utils, connected_users, groups, message_database


@app.route('/')
def index():
    return render_template('login.html')


@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data['username']
        password = data['password']

        user = services.get_user_by_username(username, True)
        if user and utils.check_passwd(password, user.usu_password):
            if username in connected_users.keys():
                return jsonify({'status': 'error', 'message': 'User already logged in'}), 409

            profileImageURL = None
            if user.usu_profile_image_uuid:
                profileImageURL = url_for('uploaded_file',
                                          filename=f'{user.profile_image.file_uuid + user.profile_image.file_ext}',
                                          _external=True)
            connected_users[username] = {
                "id": user.usu_id,
                "displayName": user.usu_displayname,
                "profileImage": profileImageURL,
                "status": user.usu_status,
                "online": True
            }
            session['username'] = username
            session['user'] = connected_users[username]

            return jsonify({'status': 'success', 'message': 'Login successful'})
        else:
            return jsonify({'status': 'error', 'message': 'Invalid credentials'}), 401
    except Exception as e:
        print(f"Erro no login: {e}")
        return jsonify({'status': 'error', 'message': 'An error occurred'}), 500


@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        username = data['username']
        password = data['password']
        display_name = data['displayName']

        user = services.get_user_by_username(username)
        if user:
            return jsonify({'status': 'error', 'message': 'Username already exists'}), 409

        user = services.create_user(username, password, display_name, None,
                                    'Hey there! I am using WhatsUT.')

        # Adiciona usuário ao dicionário de usuários conectados
        connected_users[username] = {
            "id": user.usu_id,
            "displayName": user.usu_displayname,
            "profileImage": None,
            "status": user.usu_status,
            "online": True
        }
        session['username'] = username
        session['user'] = connected_users[username]

        return jsonify({'status': 'success', 'message': 'Registration successful'})
    except Exception as e:
        print(f"Erro no registro: {e}")
        return jsonify({'status': 'error', 'message': 'An error occurred'}), 500


@app.route('/whats')
def chat():
    if 'username' not in session or session['username'] not in connected_users.keys():
        username = session.pop('username', None)
        session.pop('user', None)
        if username and username in connected_users.keys():
            del connected_users[username]
        return redirect(url_for('index'))

    username = session['username']
    return render_template('whats.html', users=connected_users, user=connected_users[username], username=username)


@app.route('/logout')
def logout():
    username = session.pop('username', None)
    print(username)
    session.pop('user', None)
    if username and username in connected_users.keys():
        del connected_users[username]

    return redirect(url_for('index'))


@app.route('/upload', methods=['POST'])
def upload_file():
    if 'username' in session or app.debug:
        # Verifica se a requisição POST contém um arquivo na chave 'file'
        if 'file' not in request.files:
            return jsonify({'error': 'Nenhum arquivo enviado'}), 400

        file = request.files['file']

        # Verifica se o nome do arquivo é válido
        if file.filename == '':
            return jsonify({'error': 'Nome de arquivo inválido'}), 400

        # Garante que o nome do arquivo seja seguro para o sistema de arquivos
        filename = utils.generate_filename(file.filename)
        uuid = filename.split('.')[0]

        # Registrando arquivo no banco de dados
        services.create_file(uuid, file.filename, filename[filename.rindex('.'):])

        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))

        # Retorna uma resposta de sucesso
        return jsonify({'message': 'Arquivo enviado com sucesso', 'uuid': uuid}), 200
    else:
        return jsonify({'error': 'Acesso não autorizado'}), 401


@app.route('/api/messages/group/<group_name>', methods=['GET'])
def get_group_messages(group_name):
    print(group_name)
    username = session.get('username')
    if not username:
        return jsonify({'status': 'error', 'message': 'Usuário não autenticado'}), 401

    # Verifica se o usuário é membro do grupo
    group = next((g for g in groups if g['name'] == group_name), None)
    if not group or username not in group['users']:
        return jsonify({'status': 'error', 'message': 'Usuário não é membro do grupo'}), 403

    # Retorna as mensagens do grupo
    if group_name in message_database:
        messages = message_database[group_name]
    else:
        messages = []
    print(messages)
    return jsonify(messages if messages else []), 200


@app.route('/api/messages/<user1>/<user2>', methods=['GET'])
def get_messages(user1, user2):
    key1 = f"{user1}-{user2}"
    key2 = f"{user2}-{user1}"

    messages = []

    if key1 in message_database:
        messages.extend(message_database[key1])
    if key2 in message_database:
        messages.extend(message_database[key2])
    messages = sorted(messages, key=lambda x: x.get('timestamp', float('inf')))
    print(messages)
    return jsonify(messages if messages else [])


@app.route('/api/people', methods=['GET'])
def get_people():
    users = services.get_all_users(True)
    users_dict = {}
    for user in users:
        isOnline = user.usu_username in connected_users.keys()
        profileImageURL = url_for('uploaded_file',
                                  filename=f'{user.profile_image.file_uuid}{user.profile_image.file_ext}',
                                  _external=True)
        users_dict[user.usu_username] = {
            "id": user.usu_id,
            "displayName": user.usu_displayname,
            "profileImage": profileImageURL,
            "status": user.usu_status,
            "online": isOnline
        }
    return jsonify(users_dict), 200


@app.route('/data/<filename>')
def uploaded_file(filename):
    # Aqui você pode implementar o envio do arquivo usando send_from_directory
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


@app.route('/api/groups', methods=['GET'])
def get_groups():
    return jsonify(groups), 200


@app.route('/api/create_group', methods=['POST'])
def create_group():
    try:
        data = request.get_json()
        group_name = data.get('name')
        if not group_name:
            return jsonify({'status': 'error', 'message': 'Nome do grupo não fornecido'}), 400

        username = session.get('username')
        if not username:
            return jsonify({'status': 'error', 'message': 'Usuário não autenticado'}), 401

        if any(group['name'] == group_name for group in groups):
            return jsonify({'status': 'error', 'message': 'Nome do grupo já existe'}), 409

        new_group = {
            'name': group_name,
            'admin': username,
            'users': [username],  # Inicia com o criador como único membro
            'requests': []  # Lista vazia de pedidos
        }

        groups.append(new_group)  # Adiciona o novo grupo à lista de grupos
        print(new_group)
        socketio.emit('group_created', groups)

        return jsonify({'status': 'success', 'message': 'Grupo criado com sucesso'}), 201
    except Exception as e:
        print(f"Erro ao criar grupo: {e}")
        return jsonify({'status': 'error', 'message': 'Erro ao criar grupo'}), 500


@app.route('/api/accept_request', methods=['POST'])
def accept_request():
    try:
        data = request.get_json()
        group_name = data.get('group_name')
        username = session.get('username')
        if not username:
            return jsonify({'status': 'error', 'message': 'Usuário não autenticado'}), 401

        for group in groups:
            if group['name'] == group_name:
                if username != group['admin']:
                    return jsonify({'status': 'error', 'message': 'Somente o administrador pode aceitar pedidos'}), 403

                request_user = data.get('username')
                if request_user in group['requests']:
                    group['requests'].remove(request_user)
                    group['users'].append(request_user)

                    return jsonify({'status': 'success', 'message': 'Pedido aceito com sucesso', 'groups': groups}), 200
                else:
                    return jsonify({'status': 'error', 'message': 'Usuário não solicitou entrada no grupo'}), 404

        return jsonify({'status': 'error', 'message': 'Grupo não encontrado'}), 404

    except Exception as e:
        print(f"Erro ao aceitar pedido de entrada: {e}")
        return jsonify({'status': 'error', 'message': 'Erro ao aceitar pedido de entrada'}), 500


@app.route('/api/remove_user_from_group', methods=['POST'])
def remove_user_from_group():
    try:
        data = request.get_json()
        group_name = data.get('group_name')
        username = session.get('username')

        if not username:
            return jsonify({'status': 'error', 'message': 'Usuário não autenticado'}), 401

        for group in groups:
            if group['name'] == group_name:
                if username != group['admin']:
                    return jsonify({'status': 'error', 'message': 'Somente o administrador pode remover membros'}), 403

                user_to_remove = data.get('username')
                if user_to_remove in group['users']:
                    if user_to_remove == group['admin']:
                        return jsonify(
                            {'status': 'error', 'message': 'Não é possível remover o administrador do grupo'}), 400
                    group['users'].remove(user_to_remove)

                    return jsonify({'status': 'success', 'message': 'Usuário removido do grupo com sucesso',
                                    'groups': groups}), 200
                else:
                    return jsonify({'status': 'error', 'message': 'Usuário não encontrado no grupo'}), 404

        return jsonify({'status': 'error', 'message': 'Grupo não encontrado'}), 404

    except Exception as e:
        print(f"Erro ao remover usuário do grupo: {e}")
        return jsonify({'status': 'error', 'message': 'Erro ao remover usuário do grupo'}), 500


@app.route('/api/get_file/<path:uuid>', methods=['GET'])
def get_file(uuid):
    file = services.get_file_by_uuid(uuid)

    if not file:
        return jsonify({'error': 'Arquivo não encontrado'}), 404

    send_filename = file.file_name + file.file_ext
    server_file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.file_uuid + file.file_ext)

    return send_file(server_file_path,
                     as_attachment=True,
                     attachment_filename=send_filename)


@app.route('/api/request_group_entry', methods=['POST'])
def request_group_entry():
    try:
        data = request.get_json()
        group_name = data.get('group_name')
        username = session.get('username')

        if not username:
            return jsonify({'status': 'error', 'message': 'Usuário não autenticado'}), 401

        for group in groups:
            if group['name'] == group_name:
                if username in group['users']:
                    return jsonify({'status': 'error', 'message': 'Você já é membro deste grupo'}), 400
                if username in group['requests']:
                    return jsonify({'status': 'error', 'message': 'Você já solicitou entrada neste grupo'}), 400
                group['requests'].append(username)
                return jsonify({'status': 'success', 'message': 'Solicitação enviada com sucesso'}), 200

        return jsonify({'status': 'error', 'message': 'Grupo não encontrado'}), 404

    except Exception as e:
        print(f"Erro ao solicitar entrada no grupo: {e}")
        return jsonify({'status': 'error', 'message': 'Erro ao solicitar entrada no grupo'}), 500
