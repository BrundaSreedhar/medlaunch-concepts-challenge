import fs from 'fs';
import path from 'path';

export class DBUtil {
  private static dataDir = path.join('src/data/', '../data');

  /**
   * Read a JSON file from the data directory
   * @param filename The name of the file (e.g., 'reports.json')
   * @returns The parsed JSON data or empty array if file doesn't exist
   */
  public static async readFile(filename: string):Promise<any[]> {
    const filePath = path.join(DBUtil.dataDir, filename);
    try {
      const data = await fs.promises.readFile(filePath, 'utf8');
      return JSON.parse(data || '[]');
    } catch (error: any) {
      // If file doesn't exist, return empty array
      if (error.code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  /**
   * Write data to a JSON file in the data directory
   * @param filename The name of the file (e.g., 'reports.json')
   * @param data The data to write
   */
  public static async writeFile(filename: string, data: any[]): Promise<void> {
    const filePath = path.join(DBUtil.dataDir, filename);
    await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
  }
}
