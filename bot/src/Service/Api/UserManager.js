export class UserManager {
  constructor() {
    this.authenticatedUsers = new Map(); // userId -> socket
    this.socketToUser = new Map(); // socket -> userId
  }

  authenticateUser(socket, userId, userData) {
    // Store user information
    this.authenticatedUsers.set(userId, socket);
    this.socketToUser.set(socket, userId);
    
    // Set user data on socket for easy access
    socket.userId = userId;
    socket.userData = userData;
    
    // Join user-specific room
    socket.join(`user_${userId}`);
    
    console.log(`User ${userId} authenticated`);
  }

  isUserAuthenticated(socket) {
    return socket.userId && this.authenticatedUsers.has(socket.userId);
  }

  getUserSocket(userId) {
    return this.authenticatedUsers.get(userId);
  }

  getUserId(socket) {
    return this.socketToUser.get(socket);
  }

  removeUser(userId) {
    const socket = this.authenticatedUsers.get(userId);
    if (socket) {
      this.socketToUser.delete(socket);
      socket.leave(`user_${userId}`);
    }
    this.authenticatedUsers.delete(userId);
    
    console.log(`User ${userId} removed from system`);
  }

  getAuthenticatedUserCount() {
    return this.authenticatedUsers.size;
  }

  getAllUserIds() {
    return Array.from(this.authenticatedUsers.keys());
  }
}
