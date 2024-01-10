import { Component } from '@angular/core';
import { SocketService } from '../socket.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-room-selector',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './room-selector.component.html',
  styleUrl: './room-selector.component.css',
})
export class RoomSelectorComponent {
  name = '';

  constructor(public socketService: SocketService) {}

  handleCreate = () => {
    this.socketService.emitCreate({ ownerName: this.name });
  };
}
