from app.models import *
from app import db
from sqlalchemy import or_, desc


def create_user(usu_username, usu_password, usu_displayname, usu_profile_image_uuid, usu_status):
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


def get_user_by_id(usu_id):
    return User.query.filter_by(usu_id=usu_id).first()


def create_chat_group(gp_name, gp_creator, gp_description, gp_image_uuid):
    group = Group(gp_name=gp_name, gp_creator=gp_creator, gp_description=gp_description, gp_image_uuid=gp_image_uuid)
    db.session.add(group)
    db.session.commit()
    return group


def add_user_to_group(ghu_group_id, ghu_user_id, ghu_is_admin, ghu_entry_date):
    group_has_user = GroupHasUser(ghu_group_id=ghu_group_id, ghu_user_id=ghu_user_id, ghu_is_admin=ghu_is_admin,
                                  ghu_entry_date=ghu_entry_date)
    db.session.add(group_has_user)
    db.session.commit()
    return group_has_user


def get_group_by_id(gp_id):
    return Group.query.filter_by(gp_id=gp_id).first()


def get_user_groups(ghu_user_id):
    return GroupHasUser.query.filter_by(ghu_user_id=ghu_user_id).all()


def get_group_users(ghu_group_id):
    return GroupHasUser.query.filter_by(ghu_group_id=ghu_group_id).all()


def get_users_private_messages(user1_id, user2_id, limit=50):
    messages = PrivateMessage.query.filter(
        or_(
            (PrivateMessage.pv_sender_id == user1_id) & (PrivateMessage.pv_receiver_id == user2_id),
            (PrivateMessage.pv_sender_id == user2_id) & (PrivateMessage.pv_receiver_id == user1_id)
        )
    ).order_by(desc(PrivateMessage.datetime)).limit(limit).all()

    return messages


def get_group_messages(group_id, limit=50):
    messages = GroupMessage.query.filter_by(gm_group_id=group_id).order_by(desc(GroupMessage.datetime)).limit(limit).all()
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


def save_file():
    pass
