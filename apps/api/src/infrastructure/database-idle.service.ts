import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { shouldReleaseDatabase } from "./database-idle";

const CHECK_MS = 15_000;
const RED = "\u001b[31m";
const BOLD = "\u001b[1m";
const RESET = "\u001b[0m";

@Injectable()
export class DatabaseIdleService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger("Database");
  private lastUse = Date.now();
  private used = false;
  private announced = false;
  private timer: NodeJS.Timeout | undefined;

  touch(): void {
    this.lastUse = Date.now();
    this.used = true;
    if (!this.announced) return;
    this.announced = false;
    this.logger.log("Բազան նորից ակտիվ է");
  }

  onModuleInit(): void {
    this.logger.log("API-ն աշխատում է. բազան կփակվի, եթե կայքը 5 րոպե չօգտագործվի");
    this.timer = setInterval(() => this.releaseIfIdle(), CHECK_MS);
    this.timer.unref();
  }

  onModuleDestroy(): void {
    if (!this.timer) return;
    clearInterval(this.timer);
  }

  private releaseIfIdle(): void {
    const idleForMs = Date.now() - this.lastUse;
    if (!shouldReleaseDatabase({ used: this.used, announced: this.announced, idleForMs })) return;
    this.announced = true;
    this.logger.log(this.idleBanner());
  }

  private idleBanner(): string {
    const line = `${RED}${BOLD}${"─".repeat(54)}${RESET}`;
    const row = (text: string): string => `${RED}${BOLD}  ${text}${RESET}`;
    return ["", line, row("Բազան անջատված է"), row("Կայքը 5 րոպե չի օգտագործվել, կապը փակվել է։"), row("Neon-ում Active-ը կարող է դառնալ Idle։"), line].join("\n");
  }
}
