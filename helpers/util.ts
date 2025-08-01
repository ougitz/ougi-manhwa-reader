import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { Dimensions } from "react-native";
import RNFS from 'react-native-fs';


const {
    width: deviceWidth, 
    height: deviceHeight
} = Dimensions.get('window');


export function wp(percentage: number) {
    const width = deviceWidth;
    return (percentage * width) / 100;
}


export function hp(percentage: number) {
    const height = deviceHeight;
    return (percentage * height) / 100;
}


export function getItemGridDimensions(
    horizontalPadding: number,
    gap: number,
    columns: number,
    originalWidth: number,
    originalHeight: number
): {width: number, height: number} {
    const width = (wp(100) - (horizontalPadding * 2) - ((columns * gap) - gap)) / columns
    const height = width * (originalHeight / originalWidth)
    return {width, height}
}


export function formatTimestamp(timestamp: string): string {    
    const date = new Date(timestamp);
    const options = { month: 'long', day: 'numeric', year: 'numeric' };    
    return date.toLocaleDateString('en-US', options as any);
}


export function secondsSince(dateTimeString: string): number {
    const inputDate = new Date(dateTimeString);
    const now = new Date()
    const diff = now.getTime() - inputDate.getTime()
    return Math.floor(diff / 1000)
}


export async function hasInternetAvailable(): Promise<boolean> {
    const state: NetInfoState = await NetInfo.fetch()
    return state.isConnected ? true : false
}


export function shuffle<T>(array: T[]) {
  let currentIndex = array.length;
  
  while (currentIndex != 0) {    
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  
}


export async function clearCache() {
    try {
        const cacheDir = RNFS.CachesDirectoryPath;
        const items = await RNFS.readDir(cacheDir);

        if (items.length > 0) {
            const deletePromises = items.map(item => RNFS.unlink(item.path));
            await Promise.all(deletePromises);
        }
        console.log("Cache content cleared successfully!");
    } catch (error) {
        console.error("Error clearing cache content:", error);
    }
}


export async function getDirectorySizeBytes(path: string): Promise<number> {
  let totalSize = 0;
  try {
    const items = await RNFS.readDir(path);
    
    const sizePromises = items.map(async (item: any) => {
      if (item.isFile()) {
        return parseInt(item.size, 10);
      }
      if (item.isDirectory()) {
        return await getDirectorySizeBytes(item.path);
      }
      return 0;
    });
    
    const sizes = await Promise.all(sizePromises);
    
    totalSize = sizes.reduce((acc, size) => acc + size, 0);

  } catch (error) {
    console.error(`Erro ao ler o diretório ${path}:`, error);
  }

  return totalSize;
};


export function formatBytes(bytes: number, decimals: number = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export async function getCacheSizeBytes(): Promise<number> {
    const s = await getDirectorySizeBytes(RNFS.CachesDirectoryPath)
    return s
}

export async function getCacheSizeKB(): Promise<number> {
    const s = await getDirectorySizeBytes(RNFS.CachesDirectoryPath)
    return Math.floor(s / 1024)
}