import { Page } from '@playwright/test';
import { TopMenu } from './components/TopMenu';
import { EnvPage } from './pages/EnvPage';
import { HttpPage } from './pages/HttpPage'; // Тот, что мы писали в прошлом ответе
import { GrpcPage } from './pages/GrpcPage';
import { GenPage } from './pages/GenPage';
import { RunnerPage } from './pages/RunnerPage';
import { HistoryPage } from './pages/HistoryPage';
import { EvaPage } from './pages/EvaPage';

export class App {
  readonly page: Page;
  readonly topMenu: TopMenu;
  readonly env: EnvPage;
  readonly http: HttpPage;
  readonly grpc: GrpcPage;
  readonly generator: GenPage;
  readonly runner: RunnerPage;
  readonly history: HistoryPage;
  readonly eva: EvaPage;

  constructor(page: Page) {
    this.page = page;
    this.topMenu = new TopMenu(page);
    this.env = new EnvPage(page);
    this.http = new HttpPage(page); // не забудь создать этот файл из предыдущего ответа
    this.grpc = new GrpcPage(page);
    this.generator = new GenPage(page);
    this.runner = new RunnerPage(page);
    this.history = new HistoryPage(page);
    this.eva = new EvaPage(page);
  }
}
