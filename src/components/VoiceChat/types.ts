
export interface Message {
  id: string;
  type: 'user' | 'ai';
  text: string;
  timestamp: Date;
}
