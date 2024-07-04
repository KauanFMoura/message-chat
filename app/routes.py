import os
import uuid

from flask import render_template, request, jsonify, session, redirect, url_for, send_from_directory, send_file
from werkzeug.utils import secure_filename

from app import app, socketio, services, utils, connected_users, group_rooms
from datetime import datetime


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

            if user.usu_profile_image_uuid:
                profileImageURL = url_for('uploaded_file',
                                          filename=f'{user.profile_image.file_uuid + user.profile_image.file_ext}',
                                          _external=True)
            else:
                profileImageURL = None

            ghus = services.get_user_groups(user.usu_id)
            groups = [ghu.ghu_group_id for ghu in ghus]

            connected_users[username] = {
                "id": user.usu_id,
                "displayName": user.usu_displayname,
                "profileImage": profileImageURL,
                "status": user.usu_status,
                "online": True,
                "groups": groups
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
            "online": True,
            "groups": []
        }
        session['username'] = username
        session['user'] = connected_users[username]

        return jsonify({'status': 'success', 'message': 'Registration successful'})
    except Exception as e:
        print(f"Erro no registro: {e}")
        return jsonify({'status': 'error', 'message': 'An error occurred'}), 500


@app.route('/whats')
def chat():
    if 'username' not in session:
        username = session.pop('username', None)
        session.pop('user', None)
        if username and username in connected_users.keys():
            del connected_users[username]
        return redirect(url_for('index'))

    try:
        user = session['user']
        username = session['username']
        if username not in connected_users.keys():
            connected_users[username] = user

        return render_template('whats.html', user=user, username=username, defaultGroupImage=app.config['DEFAULT_GROUP_IMAGE'], defaultProfileImage=app.config['DEFAULT_PROFILE_IMAGE'])
    except Exception as e:
        return redirect(url_for('index'))


@app.route('/load_data')
def load_data():
    if 'username' not in session:
        return jsonify({'error': 'Unauthorized access'}), 401

    users = get_people(True)
    groups = get_groups(True)

    return jsonify({'users': users, 'groups': groups}), 200


@app.route('/logout')
def logout():
    username = session.pop('username', None)

    session.pop('user', None)
    if username and username in connected_users.keys():
        del connected_users[username]

    return redirect(url_for('index'))


@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'})

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No selected file'})

    _, file_extension = os.path.splitext(file.filename)
    filename = str(uuid.uuid4()) + file_extension

    # Salvar o arquivo no diretório de uploads
    file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
    services.create_file(filename, file.filename, file_extension)

    return jsonify({'filename': filename})


@app.route('/api/group', methods=['GET'])
def get_group(group_id=None):
    if 'username' not in session:
        return jsonify({'error': 'Unauthorized access'}), 401

    groups = {}
    groups_query_result = services.get_groups_with_users(group_id)

    for group in groups_query_result:
        group_id = group['group_id']
        # Adicionando o grupo caso ele não esteja no dicionário de resultados
        if group_id not in groups.keys():
            if group['group_image_uuid']:
                imageURL = url_for('uploaded_file',
                                   filename=f'{group["group_image_uuid"]}{group["file_ext"]}',
                                   _external=True)
            else:
                imageURL = app.config['DEFAULT_GROUP_IMAGE']

            groups[group_id] = {
                'name': group['group_name'],
                'admin': group['creator_username'],
                'users': [],
                'description': group['group_description'],
                'imageURL': imageURL,
                'requests': [],
            }

        user = group['group_has_user']

        if group['group_active']:
            if user['accepted_request'] and user['member_username'] not in groups[group_id]['users']:
                groups[group_id]['users'].append(user['member_username'])
            elif user['member_username'] not in groups[group_id]['requests']:
                groups[group_id]['requests'].append(user['member_username'])

    return groups


@app.route('/api/people', methods=['GET'])
def get_people(server_request=False):
    if 'username' not in session:
        return jsonify({'error': 'Unauthorized access'}), 401
    users = services.get_all_users(True)
    users_dict = {}
    username_session = session.get('username')
    for user in users:
        isOnline = user.usu_username in connected_users.keys()

        if user.usu_profile_image_uuid:
            profileImageURL = url_for('uploaded_file',
                                      filename=f'{user.profile_image.file_uuid}{user.profile_image.file_ext}',
                                      _external=True)
        else:
            profileImageURL = None

        messages = services.get_user_private_messages(user.usu_id, username_session)

        users_dict[user.usu_username] = {
            "id": user.usu_id,
            "displayName": user.usu_displayname,
            "profileImage": profileImageURL,
            "status": user.usu_status,
            "online": isOnline,
            "messages": messages

        }
    if server_request:
        return users_dict
    return jsonify(users_dict), 200


@app.route('/data/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


@app.route('/api/groups', methods=['GET'])
def get_groups(server_request=False):
    if 'username' not in session:
        return jsonify({'error': 'Unauthorized access'}), 401

    groups_query_result = services.get_groups_with_users()
    group_messages = services.get_user_group_messages(session.get('user').get('id'))
    groups = {}
    for group in groups_query_result:
        group_id = group['group_id']
        # Adicionando o grupo caso ele não esteja no dicionário de resultados
        if group_id not in groups.keys():
            if group['group_image_uuid']:
                imageURL = url_for('uploaded_file',
                                   filename=f'{group["group_image_uuid"]}{group["file_ext"]}',
                                   _external=True)
            else:
                imageURL = app.config['DEFAULT_GROUP_IMAGE']

            groups[group_id] = {
                'name': group['group_name'],
                'admin': group['creator_username'],
                'users': [],
                'description': group['group_description'],
                'imageURL': imageURL,
                'requests': [],
                'messages': group_messages[group_id] if group_id in group_messages.keys() else []
            }

        user = group['group_has_user']

        if group['group_active']:
            if user['accepted_request'] and user['member_username'] not in groups[group_id]['users']:
                groups[group_id]['users'].append(user['member_username'])
            elif user['member_username'] not in groups[group_id]['requests']:
                groups[group_id]['requests'].append(user['member_username'])

    if server_request:
        return groups
    return jsonify(groups), 200


@app.route('/api/create_group', methods=['POST'])
def create_group():
    try:
        data = request.get_json()
        group_name = data.get('name')
        group_exclusion_type = data.get('exclusionType')
        group_description = data.get('description')
        user_creator_id = session.get('user').get('id')
        user_creator_username = session.get('username')

        if not group_name:
            return jsonify({'status': 'error', 'message': 'Nome do grupo não fornecido'}), 400

        if not group_exclusion_type:
            return jsonify({'status': 'error', 'message': 'Tipo de exclusão do grupo não fornecido'}), 400

        username = session.get('username')
        if not username:
            return jsonify({'status': 'error', 'message': 'Usuário não autenticado'}), 401

        new_group = services.create_group(group_name, user_creator_id, group_description, None,
                                          int(group_exclusion_type), True)
        new_ghu = services.register_user_on_group(new_group.gp_id, user_creator_id, True, datetime.now(), True)
        groups = {new_group.gp_id:
                      {'name': new_group.gp_name,
                       'admin': user_creator_username,
                       'users': [user_creator_username],
                       'description': new_group.gp_description,
                       'imageURL': app.config['DEFAULT_GROUP_IMAGE'],
                       'requests': [],
                       'messages': []}
                  }

        connected_users[username]['groups'].append(new_group.gp_id)
        group_rooms[new_group.gp_id] = [user_creator_username]
        print(group_rooms)
        socketio.emit('group_created', groups)

        return jsonify({'status': 'success', 'message': 'Grupo criado com sucesso'}), 201
    except Exception as e:
        print(f"Erro ao criar grupo: {e}")
        return jsonify({'status': 'error', 'message': 'Erro ao criar grupo'}), 500


@app.route('/api/accept_request', methods=['POST'])
def accept_request():
    try:
        username = session.get('username')
        if not username:
            return jsonify({'status': 'error', 'message': 'Usuário não autenticado'}), 401
        data = request.get_json()
        group_id = data.get('group_id')
        request_username = data.get('username')

        groups = get_group(group_id)
        group = groups[int(group_id)]

        if group:
            if group['admin'] != username:
                return jsonify({'status': 'error', 'message': 'Somente o administrador pode aceitar pedidos'}), 403

            request_user = services.get_user_by_username(request_username)
            if not request_user:
                return jsonify({'status': 'error', 'message': 'Usuário solicitante não existe'})

            ghu = services.get_group_has_user(request_user.usu_id, group_id)
            if not ghu:
                return jsonify({'status': 'error', 'message': 'Usuário não solicitou a entrada ao grupo'}), 404

            if ghu['ghu_accepted_request']:
                return jsonify({'status': 'error', 'message': 'Usuário já é membro do grupo'}), 404
            else:
                new_ghu = services.edit_group_has_user(group_id, request_user.usu_id, False, datetime.now(), True)
                if new_ghu:
                    group['requests'].remove(request_username)
                    group['users'].append(request_username)
                    socketio.emit('group_update', groups)
                    return jsonify({'status': 'success', 'message': 'Pedido aceito com sucesso'}), 200
        else:
            return jsonify({'status': 'error', 'message': 'Grupo não encontrado'}), 404

    except Exception as e:
        print(f"Erro ao aceitar pedido de entrada: {e}")
        return jsonify({'status': 'error', 'message': 'Erro ao aceitar pedido de entrada'}), 500


@app.route('/api/decline_request', methods=['POST'])
def decline_request():
    try:
        username = session.get('username')
        if not username:
            return jsonify({'status': 'error', 'message': 'Usuário não autenticado'}), 401
        data = request.get_json()
        group_id = data.get('group_id')
        request_username = data.get('username')

        groups = get_group(group_id)
        group = groups[int(group_id)]

        if group:
            if group['admin'] != username:
                return jsonify({'status': 'error', 'message': 'Somente o administrador pode recusar pedidos'}), 403

            request_user = services.get_user_by_username(request_username)
            if not request_user:
                return jsonify({'status': 'error', 'message': 'Usuário solicitante não existe'})

            ghu = services.get_group_has_user(request_user.usu_id, group_id)
            if not ghu:
                return jsonify({'status': 'error', 'message': 'Usuário não solicitou a entrada ao grupo'}), 404

            if ghu['ghu_accepted_request']:
                return jsonify({'status': 'error', 'message': 'Usuário já é membro do grupo'}), 404
            else:
                new_ghu = services.remove_group_has_user(group_id, request_user.usu_id)
                if new_ghu:
                    group['requests'].remove(request_username)
                    socketio.emit('group_update', groups)
                    return jsonify({'status': 'success', 'message': 'Pedido recusado com sucesso'}), 200
        else:
            return jsonify({'status': 'error', 'message': 'Grupo não encontrado'}), 404

    except Exception as e:
        print(f"Erro ao recusar pedido de entrada: {e}")
        return jsonify({'status': 'error', 'message': 'Erro ao recusar pedido de entrada'}), 500


@app.route('/api/remove_user_from_group', methods=['POST'])
def remove_user_from_group():
    try:
        username = session.get('username')

        if not username:
            return jsonify({'status': 'error', 'message': 'Usuário não autenticado'}), 401

        data = request.get_json()
        group_id = data.get('group_id')
        ban_username = data.get('username')

        groups = get_group(group_id)
        group = groups[int(group_id)]

        if group:
            if group['admin'] != username:
                return jsonify(
                    {'status': 'error', 'message': 'Somente o administrador pode banir um usário do Grupo'}), 403

            ban_user = services.get_user_by_username(ban_username)
            if not ban_user:
                return jsonify({'status': 'error', 'message': 'Usuário não existe'})

            if not ban_user.usu_username in group['users']:
                return jsonify({'status': 'error', 'message': 'Usuário não é membro do grupo'})

            new_ghu = services.remove_group_has_user(group_id, ban_user.usu_id)
            if new_ghu:
                group['users'].remove(ban_username)
                socketio.emit('group_update', groups)
                return jsonify({'status': 'success', 'message': 'Usuário removido com sucesso'}), 200
        else:
            return jsonify({'status': 'error', 'message': 'Grupo não encontrado'}), 404

    except Exception as e:
        print(f"Erro ao remover usuário do grupo: {e}")
        return jsonify({'status': 'error', 'message': 'Erro ao remover usuário do grupo'}), 500


@app.route('/api/get_file/<path:uuid>', methods=['GET'])
def get_file(uuid):
    file = services.get_file_by_uuid(uuid)

    if not file:
        return jsonify({'error': 'Arquivo não encontrado'}), 404

    return send_file(file, as_attachment=True, download_name=file.file_name)


@app.route('/api/request_group_entry', methods=['POST'])
def request_group_entry():
    try:
        data = request.get_json()
        group_id = data.get('group_id')
        username = session.get('username')
        user_id = session.get('user').get('id')

        if not username:
            return jsonify({'status': 'error', 'message': 'Usuário não autenticado'}), 401

        group = services.get_group_by_id(group_id)
        group_creator_username = group['gp_creator']['username']
        if not group:
            return jsonify({'status': 'error', 'message': 'Grupo não encontrado'}), 404

        ghu = services.get_group_has_user(user_id, group_id)

        if ghu:
            if ghu['ghu_accepted_request']:
                return jsonify({'status': 'error', 'message': 'Você já é membro deste grupo'}), 400
            else:
                return jsonify({'status': 'error', 'message': 'Você já solicitou entrada neste grupo'}), 400

        new_ghu = services.register_user_on_group(group_id, user_id, False, datetime.now(), False)

        if group_creator_username in connected_users.keys() and connected_users[group_creator_username]['sid']:
            socketio.emit('new_entry_request', {"id": group_id, "username": username},
                          to=connected_users[group_creator_username]['sid'])

        return jsonify({'status': 'success', 'message': 'Solicitação enviada'}), 404
    except Exception as e:
        print(f"Erro ao solicitar entrada no grupo: {e}")
        return jsonify({'status': 'error', 'message': 'Erro ao solicitar entrada no grupo'}), 500


@app.route('/api/leave_group', methods=['POST'])
def leave_group():
    try:
        data = request.get_json()
        group_id = data.get('group_id')
        username = session.get('username')
        user_id = session.get('user').get('id')

        if not username:
            return jsonify({'status': 'error', 'message': 'Usuário não autenticado'}), 401

        group = services.get_group_by_id(group_id)
        if not group:
            return jsonify({'status': 'error', 'message': 'Grupo não encontrado'}), 404

        group_admin_username = group['gp_creator']['username']
        gruop_type = group['gp_exclusion_type']  # 1 - exclusão, 2 - outro admin
        ghu = services.get_group_has_user(user_id, group_id)
        if not ghu:
            return jsonify({'status': 'error', 'message': 'Você não é membro deste grupo'}), 400

        if username == group_admin_username:
            if gruop_type == 1:
                services.delete_group(group_id)
                socketio.emit('att_group', broadcast=True)
                return jsonify({'status': 'success', 'message': 'Você saiu do grupo e ele foi excluído'}), 200
            else:
                new_ghu = services.change_group_creator_randomly(group_id)
                if new_ghu:
                    services.remove_group_has_user(group_id, user_id)
                    socketio.emit('att_group')
                    return jsonify({'status': 'success',
                                    'message': 'Você saiu do grupo e passou a administração para outro usuário'}), 200
                else:
                    services.delete_group(group_id)
                    socketio.emit('att_group')
                    return jsonify({'status': 'success', 'message': 'Você saiu do grupo e ele foi excluído'}), 200

        services.remove_group_has_user(group_id, user_id)
        socketio.emit('att_group')
        return jsonify({'status': 'success', 'message': 'Saiu do Grupo'}), 404
    except Exception as e:
        print(f"Erro ao sair do grupo: {e}")
        return jsonify({'status': 'error', 'message': 'Erro ao sair do grupo'}), 500
