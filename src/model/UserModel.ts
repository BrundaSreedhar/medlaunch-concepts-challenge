import { IUserModel, UserRole } from "../interface/IUserModel";
import { DBUtil } from "../utils/DatabaseUtil";

export class UserModel {
  private readonly filename = 'users.json';

  /**
   * Retrieve all users
   */
  public async retrieveAllUsers(): Promise<IUserModel[]> {
    return await DBUtil.readFile(this.filename);
  }

  /**
   * Retrieve a specific user by ID
   */
  public async retrieveUser(userId: string): Promise<IUserModel | null> {
    const users = await DBUtil.readFile(this.filename);
    return users.find((user: IUserModel) => user.userId === userId) || null;
  }

  /**
   * Retrieve a user by email
   */
  public async retrieveUserByEmail(email: string): Promise<IUserModel | null> {
    const users = await DBUtil.readFile(this.filename);
    return users.find(
      (user: IUserModel) => user.email.toLowerCase() === email.toLowerCase()
    ) || null;
  }

  /**
   * Create a new user
   */
  public async createUser(user: IUserModel): Promise<IUserModel> {
    const users = await DBUtil.readFile(this.filename);

    // Check if email already exists
    const existingUser = users.find(
      (u: IUserModel) => u.email.toLowerCase() === user.email.toLowerCase()
    );

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Set timestamps
    user.createdAt = user.createdAt || new Date().toISOString();
    user.updatedAt = user.updatedAt || new Date().toISOString();
    user.isActive = user.isActive !== undefined ? user.isActive : true;

    users.push(user);
    await DBUtil.writeFile(this.filename, users);

    return user;
  }

  /**
   * Update an existing user
   */
  public async updateUser(userId: string, userData: Partial<IUserModel>): Promise<IUserModel> {
    const users = await DBUtil.readFile(this.filename);
    const userIndex = users.findIndex(
      (user: IUserModel) => user.userId === userId
    );

    if (userIndex === -1) {
      throw new Error('User not found');
    }

    // If email is being updated, check for duplicates
    if (userData.email) {
      const existingUser = users.find(
        (u: IUserModel, index: number) => 
          u.email.toLowerCase() === userData.email!.toLowerCase() && index !== userIndex
      );

      if (existingUser) {
        throw new Error('User with this email already exists');
      }
    }

    // Update user while preserving ID and timestamps
    const existingUser = users[userIndex];
    const updatedUser: IUserModel = {
      ...existingUser,
      ...userData,
      userId: existingUser.userId,
      createdAt: existingUser.createdAt,
      updatedAt: new Date().toISOString()
    };

    users[userIndex] = updatedUser;
    await DBUtil.writeFile(this.filename, users);

    return updatedUser;
  }

  /**
   * Delete a user (soft delete by setting isActive to false, or hard delete)
   */
  public async deleteUser(userId: string, hardDelete: boolean = false): Promise<void> {
    const users = await DBUtil.readFile(this.filename);
    const userIndex = users.findIndex(
      (user: IUserModel) => user.userId === userId
    );

    if (userIndex === -1) {
      throw new Error('User not found');
    }

    if (hardDelete) {
      // Hard delete - remove from array
      users.splice(userIndex, 1);
      await DBUtil.writeFile(this.filename, users);
    } else {
      // Soft delete - set isActive to false
      users[userIndex].isActive = false;
      users[userIndex].updatedAt = new Date().toISOString();
      await DBUtil.writeFile(this.filename, users);
    }
  }

  /**
   * Get users by role
   */
  public async retrieveUsersByRole(role: UserRole): Promise<IUserModel[]> {
    const users = await DBUtil.readFile(this.filename);
    return users.filter(
      (user: IUserModel) => user.role === role && user.isActive
    );
  }

  /**
   * Update user role
   */
  public async updateUserRole(userId: string, role: UserRole): Promise<IUserModel> {
    const users = await DBUtil.readFile(this.filename);
    const userIndex = users.findIndex(
      (user: IUserModel) => user.userId === userId
    );

    if (userIndex === -1) {
      throw new Error('User not found');
    }

    users[userIndex].role = role;
    users[userIndex].updatedAt = new Date().toISOString();
    await DBUtil.writeFile(this.filename, users);

    return users[userIndex];
  }
}
