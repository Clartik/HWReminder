import * as fs from 'fs'
import { promisify } from 'util'

const writeFileAsync = promisify(fs.writeFile);
const readFileAsync = promisify(fs.readFile);

class SaveManager {
    static async writeData(filepath: string, data: Object): Promise<boolean> {
        const formattedData = JSON.stringify(data, null, 2);

        try {
            await writeFileAsync(filepath, formattedData, 'utf-8');
        } catch (error) {
            console.error(error);
            return false;
        }

        return true;
    }

    static async getData(filepath: string): Promise<Object | null> {
        try {
            const data = await readFileAsync(filepath, 'utf-8');
            return JSON.parse(data);
        }
        catch (error) {
            console.error(error);
            return null;
        }
    }

    static writeDataSync(filepath: string, data: Object): boolean {
        const formattedData = JSON.stringify(data, null, 2);

        try {
            fs.writeFileSync(filepath, formattedData, 'utf-8');
        } catch (error) {
            console.error(error);
            return false;
        }

        return true;
    }

    static getDataSync(filepath: string): Object | null {
        try {
            const data = fs.readFileSync(filepath, 'utf-8');
            return JSON.parse(data);    
        } catch (error) {
            console.error(error);
            return null;
        }
    }
}

export default SaveManager;