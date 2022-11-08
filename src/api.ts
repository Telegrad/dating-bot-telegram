import Config from "./config";
import axios, { Axios } from 'axios';

export type Gender = 'boy' | 'girl';

export type Account = {
  fullName: string;
  gender?: Gender;
  country?: string;
  telegramUserId: number;
};

export default class Api {
  private config: Config;
  private api: Axios;

  constructor(config: Config) {
    this.config = config;
    this.api = axios.create({ baseURL: config.serverUrl });
  }

  async saveAccount(account: Account): Promise<Account | null> {
    try {
      const { data } = await this.api.post('/accounts', account);

      return data as Account;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async updateAccount(account: Account) {
    const { data } = await this.api.put(`/accounts/telegram/${account.telegramUserId}`, account);

    return data as Account;
  }

  async deleteAccount(account: Account) {
    await this.api.delete(`/accounts/${account.telegramUserId}`)
  }
}
