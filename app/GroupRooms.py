import threading


class GroupRooms:
    def __init__(self):
        self.semaphore = threading.Semaphore(1)
        self.rooms = {}

    def add_user_to_room(self, room, username):
        with self.semaphore:
            if room not in self.rooms and username not in self.rooms[room]:
                self.rooms[room] = []
            self.rooms[room].append(username)

    def remove_user_from_room(self, room, username):
        with self.semaphore:
            if room in self.rooms and username in self.rooms[room]:
                self.rooms[room].remove(username)
                if not self.rooms[room]:
                    del self.rooms[room]

    def get_users_from_room(self, room):
        with self.semaphore:
            if room in self.rooms:
                for user in self.rooms[room]:
                    yield user
            return []

    def get_rooms(self):
        with self.semaphore:
            return self.rooms.keys()
