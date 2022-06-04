import { Directive, ElementRef, HostListener, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  selector: '[appImageExtractor]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ImageAccessorDirective),
      multi: true
    }
  ]
})
export class ImageAccessorDirective implements ControlValueAccessor {
  private file: File | null = null;

  onChange: (file: File) => void  = () => {};

  onTouched = (): void => {};

  constructor(private readonly element: ElementRef) {}

  // eslint-disable-next-line @typescript-eslint/naming-convention
  @HostListener('change', ['$event.target.files']) _handleInput(event: FileList): void {
    const file = event.item(0);

    if (file) {
      this.file = file;
      this.onChange(this.file);
      this.onTouched();
    }
  }

  writeValue(value: File): void {
    this.element.nativeElement.value = '';
    this.file = value;
  }

  registerOnChange(fn: (file: File) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
}
