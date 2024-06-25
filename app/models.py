from app import db


class User(db.Model):
    __tablename__ = 'user'

    usu_id = db.Column(db.Integer, primary_key=True)
    usu_username = db.Column(db.String(20), nullable=False, unique=True)
    usu_password = db.Column(db.String(40), nullable=False)
    usu_displayname = db.Column(db.String(100), nullable=False)
    usu_profile_image_uuid = db.Column(db.String(100), nullable=True)
    usu_status = db.Column(db.String(100), nullable=False)


class PrivateMessage(db.Model):
    __tablename__ = 'private_message'

    pv_id = db.Column(db.Integer, primary_key=True)
    pv_sender_id = db.Column(db.Integer, db.ForeignKey('user.usu_id'), nullable=False)
    pv_receiver_id = db.Column(db.Integer, db.ForeignKey('user.usu_id'), nullable=False)
    pv_message = db.Column(db.String(500), nullable=False)
    pv_datetime = db.Column(db.DateTime, nullable=False)
    pv_file_uuid = db.Column(db.String(100), nullable=True)


class Group(db.Model):
    __tablename__ = 'group'

    gp_id = db.Column(db.Integer, primary_key=True)
    gp_name = db.Column(db.String(100), nullable=False)
    gp_creator = db.Column(db.Integer, db.ForeignKey('user.usu_id'), nullable=False)
    gp_description = db.Column(db.String(100), nullable=True)
    gp_image_uuid = db.Column(db.String(100), nullable=True)


class GroupHasUser(db.Model):
    __tablename__ = 'group_has_user'

    ghu_group_id = db.Column(db.Integer, db.ForeignKey('group.gp_id'), nullable=False, primary_key=True)
    ghu_user_id = db.Column(db.Integer, db.ForeignKey('user.usu_id'), nullable=False, primary_key=True)
    ghu_is_admin = db.Column(db.Boolean, nullable=False)
    ghu_entry_date = db.Column(db.DateTime, nullable=False)


class GroupMessage(db.Model):
    __tablename__ = 'group_message'

    gm_id = db.Column(db.Integer, primary_key=True)
    gm_group_id = db.Column(db.Integer, db.ForeignKey('group.gp_id'), nullable=False)
    gm_sender_id = db.Column(db.Integer, db.ForeignKey('user.usu_id'), nullable=False)
    gm_message = db.Column(db.String(500), nullable=False)
    gm_datetime = db.Column(db.DateTime, nullable=False)
    gm_file_uuid = db.Column(db.String(100), nullable=True)
