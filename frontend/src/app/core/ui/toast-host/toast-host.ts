import { Component } from '@angular/core';
import { ToastService } from '../toast';
import { Toast } from '../../../components/other/toast/toast';


@Component({
  selector: 'app-toast-host',
  imports: [Toast],
  templateUrl: './toast-host.html',
  styleUrl: './toast-host.css',
})
export class ToastHost {

    constructor(public toastService: ToastService){}




}
