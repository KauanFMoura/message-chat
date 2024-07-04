from app import socketio, connected_users, group_rooms, services
from flask import session, jsonify, request
from flask_socketio import emit, disconnect

import threading


@socketio.on('connect')
def handle_connect():
    username = session.get('username')
    if username in connected_users.keys():
        connected_users[username]['sid'] = request.sid
        print(f'{username} connected')
    else:
        disconnect()


@socketio.on('disconnect')
def handle_disconnect():
    username = session.get('username')
    if username and username in connected_users.keys():
        session['user'] = connected_users[username]
        del connected_users[username]
        print(f'{username} disconnected')
        emit('disconnect', username, broadcast=False)  # Emitir evento para o cliente que se desconectou


@socketio.on('reconnect')
def handle_reconnect():
    sid = request.sid
    username = session.get('username')
    if username in connected_users.keys():
        connected_users[username]['sid'] = sid
    else:
        connected_users[username] = session.get('user')
        connected_users[username]['sid'] = sid
    print(f'Cliente reconectado: {sid}')


@socketio.on('user_back_online')
def handle_user_back_online():
    username = session.get('username')
    if username:
        if username not in connected_users.keys():
            connected_users[username] = session.get('user')
        print(f'{username} is back online')
        emit('user_update', connected_users, broadcast=True)
    else:
        print('Unauthorized access')  # Lida com o caso em que o usuário não está autenticado corretamente


@socketio.on('private_message')
def handle_message(data):
    sender = data['sender']
    receiver = data['receiver']
    message = data['message']
    timestamp = data['timestamp']
    uuid = data.get('file_uuid')
    sid_receiver = connected_users.get(receiver, {}).get('sid')

    if receiver in connected_users.keys():
        receiver_id = connected_users[receiver]['id']
    else:
        receiver_id = services.get_user_by_username(receiver).usu_id

    if sender in connected_users.keys():
        sender_id = connected_users[sender]['id']
    else:
        sender_id = services.get_user_by_username(sender).usu_id

    message_data = {
        'sender': sender,
        'message': message,
        'timestamp': timestamp,
        'file_uuid': uuid
    }

    if sid_receiver:
        emit('private_message', message_data, room=sid_receiver)

    if uuid:
        print(f'{sender} sent a private message to {receiver} with file')
    else:
        print(f'{sender} sent a private message to {receiver}')
    # Registrando mensagem no banco de dados
    services.register_private_message(sender_id, receiver_id, message, timestamp, uuid)


@socketio.on('group_message')
def handle_group_message(data):
    sender = data['sender']
    group_id = int(data['group_id'])
    message = data['message']
    timestamp = data['timestamp']
    uuid = data.get('file_uuid')

    # Verifica se o grupo já existe
    if group_id not in group_rooms.keys():
        # Se o grupo não existe, retorna um erro ou faz alguma outra ação necessária
        return jsonify({'status': 'error', 'message': 'Grupo não existe'}), 404

    if sender not in group_rooms[group_id]:
        # Se o usuário não está no grupo
        return jsonify({'status': 'error', 'message': 'Usuário não está no grupo'}), 403

    room_list = [connected_users[user]['sid'] for user in group_rooms[group_id] if user != sender]

    message_data = {
        'sender': sender,
        'message': message,
        'group_id': group_id,
        'timestamp': timestamp,
        'file_uuid': uuid
    }

    # Se a lista não estiver vazia, emito a mensagem (é necessário, pois se a lista está vazia, o Flask envia a mensagem para o sender)
    if room_list:
        emit('group_message', message_data, room=room_list)

    if uuid:
        print(f'{sender} sent a group message to {group_id} with file')
    else:
        print(f'{sender} sent a group message to {group_id}')

    # Tentar pegar o ID com base nos usuarios conectados
    if sender in connected_users.keys():
        sender_id = connected_users[sender]['id']
    else:
        # Se não conseguir, pega o ID do banco
        sender_id = services.get_user_by_username(sender).usu_id

    services.register_group_message(group_id, sender_id, message, timestamp, uuid)
