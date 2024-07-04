from app.models import *
from app import db, utils
from sqlalchemy import or_, desc, func
from sqlalchemy.orm import aliased
from sqlalchemy.sql import and_, or_, select
import random


def create_user(usu_username, usu_password, usu_displayname, usu_profile_image_uuid, usu_status):
    usu_password = utils.gen_hash_pasw(usu_password)
    user = User(usu_username=usu_username, usu_password=usu_password, usu_displayname=usu_displayname,
                usu_profile_image_uuid=usu_profile_image_uuid, usu_status=usu_status)
    db.session.add(user)
    db.session.commit()
    return user


def register_private_message(pv_sender_id, pv_receiver_id, pv_message, pv_datetime, pv_file_uuid):
    private_message = PrivateMessage(pv_sender_id=pv_sender_id, pv_receiver_id=pv_receiver_id, pv_message=pv_message,
                                     pv_datetime=pv_datetime, pv_file_uuid=pv_file_uuid)
    db.session.add(private_message)
    db.session.commit()
    return private_message


def register_group_message(gm_group_id, gm_sender_id, gm_message, gm_datetime, gm_file_uuid):
    group_message = GroupMessage(gm_group_id=gm_group_id, gm_sender_id=gm_sender_id, gm_message=gm_message,
                                 gm_datetime=gm_datetime, gm_file_uuid=gm_file_uuid)
    db.session.add(group_message)
    db.session.commit()
    return group_message


def get_user_by_id(usu_id, include_profile_image=False):
    query = db.session.query(User)
    if include_profile_image:
        query = query.options(db.lazyload(User.profile_image))
    users = query.all()
    return User.query.filter_by(usu_id=usu_id).first()


def get_groups():
    query = db.session.query(Group)

    return Group.query.all()


def get_user_by_username(usu_username, include_profile_image=False):
    query = db.session.query(User)
    if include_profile_image:
        query = query.options(db.lazyload(User.profile_image))
    return query.filter_by(usu_username=usu_username).first()


def create_group(gp_name, gp_creator, gp_description, gp_image_uuid, gp_exclusion_type, gp_active):
    group = Group(gp_name=gp_name, gp_creator=gp_creator, gp_description=gp_description, gp_image_uuid=gp_image_uuid,
                  gp_exclusion_type=gp_exclusion_type, gp_active=gp_active)
    db.session.add(group)
    db.session.commit()
    return group


def add_user_to_group(ghu_group_id, ghu_user_id, ghu_is_admin, ghu_entry_date):
    group_has_user = GroupHasUser(ghu_group_id=ghu_group_id, ghu_user_id=ghu_user_id, ghu_is_admin=ghu_is_admin,
                                  ghu_entry_date=ghu_entry_date)
    db.session.add(group_has_user)
    db.session.commit()
    return group_has_user


def get_user_group_messages(user_id):
    # Subconsulta para obter todos os grupos dos quais o usuário participa e a solicitação foi aceita
    user_groups_subquery = (
        db.session.query(GroupHasUser.ghu_group_id)
        .filter(GroupHasUser.ghu_user_id == user_id)
        .filter(GroupHasUser.ghu_accepted_request == True)
        .subquery()
    )

    # Subconsulta para obter até 50 mensagens mais recentes por grupo
    group_messages_subquery = (
        db.session.query(
            GroupMessage.gm_id,
            GroupMessage.gm_group_id,
            GroupMessage.gm_message,
            GroupMessage.gm_datetime,
            GroupMessage.gm_file_uuid,
            GroupMessage.gm_sender_id,
            User.usu_username.label('sender_username'),
            func.row_number().over(
                partition_by=GroupMessage.gm_group_id,
                order_by=desc(GroupMessage.gm_datetime)
            ).label('row_num')
        )
        .join(user_groups_subquery, GroupMessage.gm_group_id == user_groups_subquery.c.ghu_group_id)
        .join(User, User.usu_id == GroupMessage.gm_sender_id)
        .subquery()
    )

    # Consulta principal para obter até 50 mensagens por grupo
    messages = (
        db.session.query(group_messages_subquery)
        .filter(group_messages_subquery.c.row_num <= 50)
        .order_by(group_messages_subquery.c.gm_group_id, desc(group_messages_subquery.c.gm_datetime))
        .all()
    )

    # Formatar os resultados como uma lista de dicionários
    result = {}
    for message in messages:
        if message.gm_group_id not in result:
            result[message.gm_group_id] = []

        result[message.gm_group_id].append({
            'message': message.gm_message,
            'timestamp': message.gm_datetime,
            'file_uuid': message.gm_file_uuid,
            'sender': message.sender_username
        })

    return result


def get_groups_with_users(gp_id=None):
    UserAlias = aliased(User)
    FileAlias = aliased(File)

    # Consulta para obter todos os grupos, suas respectivas informações de usuários, o nome de usuário do criador do grupo, e as informações do arquivo
    groups_with_users = (
        db.session.query(
            Group,
            GroupHasUser,
            User.usu_username.label('creator_username'),
            UserAlias.usu_username.label('member_username'),
            FileAlias.file_name.label('file_name'),
            FileAlias.file_ext.label('file_ext')
        )
        .outerjoin(GroupHasUser, Group.gp_id == GroupHasUser.ghu_group_id)
        .outerjoin(User, Group.gp_creator == User.usu_id)  # Junta a tabela User para obter o nome de usuário do criador
        .outerjoin(UserAlias,
                   GroupHasUser.ghu_user_id == UserAlias.usu_id)  # Junta a tabela User para obter o nome de usuário do membro
        .outerjoin(FileAlias, Group.gp_image_uuid == FileAlias.file_uuid)
    # Junta a tabela File para obter detalhes do arquivo
    )

    if gp_id:
        groups_with_users = groups_with_users.filter(GroupHasUser.ghu_group_id == gp_id)
    groups_with_users.all()

    # Formatar os resultados como uma lista de dicionários
    result = []
    for group, group_has_user, creator_username, member_username, file_name, file_ext in groups_with_users:
        result.append({
            'group_id': group.gp_id,
            'group_name': group.gp_name,
            'group_creator': group.gp_creator,
            'creator_username': creator_username,  # Inclui o nome de usuário do criador
            'group_description': group.gp_description,
            'group_image_uuid': group.gp_image_uuid,
            'group_exclusion_type': group.gp_exclusion_type,
            'group_active': group.gp_active,
            'file_name': file_name,  # Nome do arquivo
            'file_ext': file_ext,  # Extensão do arquivo
            'group_has_user': {
                'user_id': group_has_user.ghu_user_id if group_has_user else None,
                'member_username': member_username,  # Inclui o nome de usuário do membro
                'is_admin': group_has_user.ghu_is_admin if group_has_user else None,
                'entry_date': group_has_user.ghu_entry_date if group_has_user else None,
                'accepted_request': group_has_user.ghu_accepted_request if group_has_user else None
            }
        })

    return result


def get_group_by_id(gp_id):
    group = db.session.query(Group, User).join(User, Group.gp_creator == User.usu_id).filter(
        Group.gp_id == gp_id).first()

    if not group:
        return None

    group_info = {
        "gp_id": group.Group.gp_id,
        "gp_name": group.Group.gp_name,
        "gp_creator": {
            "id": group.User.usu_id,
            "username": group.User.usu_username
        },
        "gp_description": group.Group.gp_description,
        "gp_image_uuid": group.Group.gp_image_uuid,
        "gp_exclusion_type": group.Group.gp_exclusion_type,
        "gp_active": group.Group.gp_active,
    }

    return group_info


def get_user_groups(ghu_user_id):
    return GroupHasUser.query.filter_by(ghu_user_id=ghu_user_id).all()


def get_group_users(ghu_group_id):
    return GroupHasUser.query.filter_by(ghu_group_id=ghu_group_id).all()


def get_user_private_messages(user_id, username_requested, limit=50):
    # Aliases para a subquery
    # Aliases para a subquery
    pm_alias = aliased(PrivateMessage)
    sender_alias = aliased(User)
    receiver_alias = aliased(User)

    # Subquery para numerar as mensagens de cada conjunto de usuário
    subquery = (
        db.session.query(
            pm_alias.pv_id,
            pm_alias.pv_datetime,
            pm_alias.pv_file_uuid,
            pm_alias.pv_message,
            func.row_number().over(
                partition_by=(pm_alias.pv_sender_id, pm_alias.pv_receiver_id),
                order_by=pm_alias.pv_datetime
            ).label('row_num')
        )
        .filter(
            or_(
                pm_alias.pv_sender_id == user_id,
                pm_alias.pv_receiver_id == user_id
            )
        )
    ).subquery()

    # Consulta final para obter apenas as mensagens com row_num <= limit
    final_query = (
        db.session.query(
            PrivateMessage.pv_id,
            PrivateMessage.pv_datetime,
            PrivateMessage.pv_file_uuid,
            PrivateMessage.pv_message,
            sender_alias.usu_username.label('sender_username'),
            receiver_alias.usu_username.label('receiver_username')
        )
        .join(subquery, PrivateMessage.pv_id == subquery.c.pv_id)
        .join(sender_alias, sender_alias.usu_id == PrivateMessage.pv_sender_id)
        .join(receiver_alias, receiver_alias.usu_id == PrivateMessage.pv_receiver_id)
        .filter(subquery.c.row_num <= limit)
        .order_by(PrivateMessage.pv_datetime)
        .limit(limit)
    )

    result = final_query.all()

    messages = {}
    for message in result:
        if message.receiver_username == username_requested:
            message_key = message.sender_username
        else:
            message_key = message.receiver_username

        if message_key not in messages.keys():
            messages[message_key] = []

        messages[message_key].append({
            "receiver": message.receiver_username,
            "sender": message.sender_username,
            "message": message.pv_message,
            "timestamp": message.pv_datetime,
            "file_uuid": message.pv_file_uuid,
            "file": message.pv_file_uuid if message.pv_file_uuid else None
        })
    return messages


def get_group_messages(group_id, limit=50):
    messages = GroupMessage.query.filter_by(gm_group_id=group_id).order_by(desc(GroupMessage.datetime)).limit(
        limit).all()
    return messages


def remove_user_from_group(ghu_group_id, ghu_user_id):
    group_has_user = GroupHasUser.query.filter_by(ghu_group_id=ghu_group_id, ghu_user_id=ghu_user_id).first()
    db.session.delete(group_has_user)
    db.session.commit()
    return group_has_user


def add_admin_group_user(ghu_group_id, ghu_user_id):
    group_has_user = GroupHasUser.query.filter_by(ghu_group_id=ghu_group_id, ghu_user_id=ghu_user_id).first()
    group_has_user.ghu_is_admin = True
    db.session.commit()
    return group_has_user


def remove_admin_group_user(ghu_group_id, ghu_user_id):
    group_has_user = GroupHasUser.query.filter_by(ghu_group_id=ghu_group_id, ghu_user_id=ghu_user_id).first()
    group_has_user.ghu_is_admin = False
    db.session.commit()
    return group_has_user


def get_file_by_uuid(file_uuid):
    return File.query.filter_by(file_uuid=file_uuid).first()


def create_file(file_uuid, file_name, file_ext):
    file = File(file_uuid=file_uuid, file_name=file_name, file_ext=file_ext)
    db.session.add(file)
    db.session.commit()
    return file


def edit_user(usu_id, usu_username, usu_password, usu_displayname, usu_profile_image_uuid, usu_status):
    user = User.query.filter_by(usu_id=usu_id).first()
    user.usu_username = usu_username
    user.usu_password = usu_password
    user.usu_displayname = usu_displayname
    user.usu_profile_image_uuid = usu_profile_image_uuid
    user.usu_status = usu_status
    db.session.commit()
    return user


def get_all_users(include_profile_image=False):
    # Consulta todos os usuários
    query = db.session.query(User)
    if include_profile_image:
        query = query.options(db.lazyload(User.profile_image))
    users = query.all()
    return users


def register_user_on_group(ghu_group_id, ghu_user_id, ghu_is_admin, ghu_entry_date, ghu_accepted_request):
    group_has_user = GroupHasUser(ghu_group_id=ghu_group_id, ghu_user_id=ghu_user_id, ghu_is_admin=ghu_is_admin,
                                  ghu_entry_date=ghu_entry_date, ghu_accepted_request=ghu_accepted_request)
    db.session.add(group_has_user)
    db.session.commit()
    return group_has_user


def get_group_has_user(user_id, group_id):
    result = GroupHasUser.query.filter_by(ghu_group_id=group_id, ghu_user_id=user_id).first()
    if result:
        return result.__dict__
    return result


def edit_group_has_user(ghu_group_id, ghu_user_id, ghu_is_admin, ghu_entry_date, ghu_accepted_request):
    group_has_user = GroupHasUser.query.filter_by(ghu_group_id=ghu_group_id, ghu_user_id=ghu_user_id).first()
    group_has_user.ghu_is_admin = ghu_is_admin
    group_has_user.ghu_entry_date = ghu_entry_date
    group_has_user.ghu_accepted_request = ghu_accepted_request
    db.session.commit()
    return group_has_user


def remove_group_has_user(ghu_group_id, ghu_user_id):
    group_has_user = GroupHasUser.query.filter_by(ghu_group_id=ghu_group_id, ghu_user_id=ghu_user_id).first()
    db.session.delete(group_has_user)
    db.session.commit()
    return group_has_user


def delete_group(group_id):
    GroupHasUser.query.filter_by(ghu_group_id=group_id).delete()
    group = Group.query.filter_by(gp_id=group_id).first()
    if group:
        db.session.delete(group)

    db.session.commit()
    return group


def change_group_creator_randomly(group_id):
    group = Group.query.filter_by(gp_id=group_id).first()
    if not group:
        return None

    users_in_group = GroupHasUser.query.filter(GroupHasUser.ghu_group_id == group_id,
                                               GroupHasUser.ghu_user_id != group.gp_creator).all()

    if not users_in_group:
        return None

    new_creator = random.choice(users_in_group).ghu_user_id
    group.gp_creator = new_creator
    db.session.commit()

    return group