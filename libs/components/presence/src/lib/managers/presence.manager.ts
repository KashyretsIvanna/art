import { Socket } from 'socket.io';

export class PresenceManager {
  private profileSubscriptions = new Map<number, Set<Socket>>();

  getSubscribers(profileId: number) {
    return this.profileSubscriptions.get(profileId);
  }

  unSubscribeFromAll(client: Socket) {
    for (const [_, subscriptions] of this.profileSubscriptions) {
      subscriptions.delete(client);
    }
  }

  unSubscribeSome(profileIds: number[], client: Socket) {
    for (const profileId of profileIds) {
      const subscribers = this.profileSubscriptions.get(profileId);
      if (subscribers) {
        subscribers.delete(client);
      }
    }
  }

  addSubscriptions(profileIds: number[], client: Socket) {
    for (const profileId of profileIds) {
      const subscribers = this.getSubscribers(profileId);
      if (subscribers) {
        subscribers.add(client);
      } else {
        this.profileSubscriptions.set(profileId, new Set([client]));
      }
    }
  }
}
