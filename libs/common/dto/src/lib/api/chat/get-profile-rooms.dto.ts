type RoomWithData = {
  roomId: number;
  profileId: number;
  lastMessage: Message;
  noOfUnread: number;
};

type Message = {
  content: string | null;
  attachmentId: number | null;
  authorId: number;
  createdAt: Date;
};

export class ProfileRoomsRes {
  rooms: RoomWithData[];
}
