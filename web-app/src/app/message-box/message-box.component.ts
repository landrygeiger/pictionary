import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  ViewChild,
} from "@angular/core";
import { SocketService } from "../socket.service";
import { FormsModule } from "@angular/forms";
import { Session } from "@pictionary/shared";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-message-box",
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: "./message-box.component.html",
  styleUrl: "./message-box.component.css",
})
export class MessageBoxComponent implements AfterViewChecked {
  message = "";

  @Input({ required: true }) session!: Session;

  @ViewChild("messageContainer") messageContainer!: ElementRef<HTMLDivElement>;

  constructor(public socketService: SocketService) {}

  public ngAfterViewChecked(): void {
    this.messageContainer.nativeElement.scrollTop =
      this.messageContainer.nativeElement.scrollHeight;
  }

  public sendMessage = () => {
    this.socketService.emitMessage({
      sessionId: this.socketService.session?.id ?? "",
      message: this.message,
    });
    this.message = "";
  };
}
