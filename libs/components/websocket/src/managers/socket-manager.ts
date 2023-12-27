import { Socket } from 'socket.io';

export class SocketManager {
  private connectedProfiles = new Map<Socket, number>();

  addConnection(client: Socket, profileId: number) {
    this.connectedProfiles.set(client, profileId);
  }

  removeConnection(client: Socket) {
    this.connectedProfiles.delete(client);
  }

  getConnectionByProfileId(profileId: number) {
    for (const [k, v] of this.connectedProfiles.entries()) {
      if (v === profileId) {
        return k;
      }
    }

    return null;
  }

  getProfileIdBySocket(client: Socket) {
    return this.connectedProfiles.get(client);
  }
}
