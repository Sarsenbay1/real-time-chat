import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Message } from './entities/message.entity';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message-dto';
import { UserId } from 'src/common/get-user.decorator';

@WebSocketGateway({ cors: { origin: '*' } })
// @Controller('chat/:id')
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private chatService: ChatService) {}
  @WebSocketServer() server: Server;

  handleConnection(client: Socket) {
    console.log('New user connected..', client.id);

    client.broadcast.emit('user-joined', {
      message: `New user joined the chat: ${client.id}`,
    });
  }

  handleDisconnect(client: Socket) {
    console.log('user disconnected..', client.id);

    this.server.emit('user-left', {
      message: `User Left the chat: ${client.id}`,
    });
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    client: Socket,
    @MessageBody() sendMessage: CreateMessageDto,
    // @UserIdFromWebsoket() userId: number,
  ): Promise<void> {
    console.log(sendMessage);
    console.log(UserId);
    // const payload =
    const message = await this.chatService.createMessage(sendMessage);
    this.server.emit('recMessage', message);
    // this.server.emit('message', message);
    // console.log(message);
  }

  afterInit(server: Server) {
    console.log(server);
    //Выполняем действия
  }
}
