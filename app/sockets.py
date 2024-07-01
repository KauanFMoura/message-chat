from app import socketio, connected_users, private_rooms, message_database, group_rooms, groups
from flask import session, jsonify
from flask_socketio import emit, join_room, leave_room
from datetime import datetime


@socketio.on('connect')
def handle_connect():
    username = session.get('username')
    if username:
        print(f'{username} connected')


@socketio.on('disconnect')
def handle_disconnect():
    username = session.get('username')
    if username and username in connected_users:
        if username in connected_users.keys():
            del connected_users[username]
        print(f'{username} disconnected')
        emit('disconnect', username, broadcast=False)  # Emitir evento para o cliente que se desconectou


@socketio.on('user_back_online')
def handle_user_back_online():
    username = session.get('username')
    if username:
        if username not in connected_users.keys():
            connected_users[username](session.get('user'))
        print(f'Usuários conectados: {connected_users}')
        print(f'{username} is back online')
        emit('user_update', connected_users, broadcast=True)
    else:

        print('Unauthorized access')  # Lida com o caso em que o usuário não está autenticado corretamente


@socketio.on('join_room')
def on_join(data):
    print('Join Room')
    username = data['username']
    room = data['room']

    if room not in private_rooms:
        # Verifica se a sala invertida já existe
        reversed_room = '-'.join(reversed(room.split('-')))
        if reversed_room in private_rooms:
            room = reversed_room

    if room not in private_rooms:
        private_rooms[room] = set()

    join_room(room)
    private_rooms[room].add(username)

    print(f'{username} joined room {room}')
    emit('room_status', {'room': room, 'users': list(private_rooms[room])}, broadcast=True)


@socketio.on('leave_room')
def on_leave(data):
    username = data['username']
    room = data['room']

    if room in private_rooms and username in private_rooms[room]:
        leave_room(room)
        private_rooms[room].remove(username)

    print(f'{username} left room {room}')
    emit('room_status', {'room': room, 'users': list(private_rooms[room])}, broadcast=True)


@socketio.on('message_private')
def handle_message(data):
    sender = data['sender']
    receiver = data['receiver']
    message = data['message']

    room1 = f"{sender}-{receiver}"
    room2 = f"{receiver}-{sender}"

    if room1 in private_rooms:
        room = room1
    elif room2 in private_rooms:
        room = room2
    else:
        # Se a sala não existe, cria uma nova
        room = room1
        private_rooms[room] = set()

    private_rooms[room].add(sender)
    private_rooms[room].add(receiver)

    join_room(room)

    # Armazena a mensagem no banco de dados
    key = f"{sender}-{receiver}"
    if key not in message_database:
        message_database[key] = []
    message_database[key].append({'sender': sender, 'message': message, 'timestamp': datetime.now().timestamp()})

    socketio.emit('private_message', {'sender': sender, 'message': message})

    print(f'{sender} sent a private message to {receiver}')



@socketio.on('join_group')
def on_join_group(data):
    username = data['username']
    group_name = data['group_name']

    # Verifica se o usuário está realmente autorizado a entrar no grupo
    authorized = False
    for group in groups:
        if group['name'] == group_name and username in group['users']:
            authorized = True
            break

    if not authorized:
        # Emitir um erro de autorização para o cliente
        emit('group_join_error', {'message': 'Você não tem permissão para entrar neste grupo'})
        return

    if group_name not in group_rooms:
        group_rooms[group_name] = set()

    join_room(group_name)
    group_rooms[group_name].add(username)

    print(f'{username} joined group room {group_name}')
    emit('group_room_status', {'room': group_name, 'users': list(group_rooms[group_name])}, broadcast=True)

@socketio.on('leave_group')
def on_leave_group(data):
    username = data['username']
    group_name = data['group_name']

    if group_name in group_rooms and username in group_rooms[group_name]:
        leave_room(group_name)
        group_rooms[group_name].remove(username)

    print(f'{username} left group room {group_name}')
    emit('group_room_status', {'room': group_name, 'users': list(group_rooms[group_name])}, broadcast=True)

@socketio.on('message_group')
def handle_group_message(data):
    sender = data['sender']
    group_name = data['groupName']
    message = data['message']
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    # Verifica se o grupo já existe
    if any(group['name'] == group_name for group in groups):
        room = group_name  # Define a sala como o nome do grupo
    else:
        # Se o grupo não existe, retorna um erro ou faz alguma outra ação necessária
        return jsonify({'status': 'error', 'message': 'Grupo não existe'}), 404

    # Registra a mensagem no banco de dados ou na estrutura apropriada
    if group_name not in message_database:
        message_database[group_name] = []

    message_database[group_name].append({'sender': sender, 'message': message, 'timestamp': timestamp})

    # Emite a mensagem para o grupo
    socketio.emit('group_message', {'sender': sender, 'message': message, 'group_name': group_name, 'timestamp': timestamp}, room=room)

    print(f'{sender} sent a group message to {group_name}')
