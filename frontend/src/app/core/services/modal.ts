import { Injectable, ComponentRef, ApplicationRef, createComponent, EnvironmentInjector, Type } from '@angular/core';

export interface ModalConfig {
  data?: any;
  panelClass?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modalRef: ComponentRef<any> | null = null;

  constructor(
    private appRef: ApplicationRef,
    private injector: EnvironmentInjector
  ) {}

  open<T>(component: Type<T>, config?: ModalConfig): ComponentRef<T> {
    this.close();

    this.modalRef = createComponent(component, {
      environmentInjector: this.injector
    });

    if (config?.data) {
      Object.assign(this.modalRef.instance as any, { data: config.data });
    }

    this.appRef.attachView(this.modalRef.hostView);

    const domElem = (this.modalRef.hostView as any).rootNodes[0] as HTMLElement;
    document.body.appendChild(domElem);

    document.body.style.overflow = 'hidden';

    return this.modalRef as ComponentRef<T>;
  }

  close(): void {
    if (this.modalRef) {
      this.appRef.detachView(this.modalRef.hostView);
      this.modalRef.destroy();
      this.modalRef = null;
      
      document.body.style.overflow = '';
    }
  }
}