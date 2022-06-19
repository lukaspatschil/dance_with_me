import { animate, state, style, transition, trigger } from '@angular/animations';

export const moveIn = trigger('moveIn', [
  state('void', style({ width:'100%' })),
  state('', style({  width:'100%' })),
  transition(':enter', [
    style({ opacity:'0', transform:'translateX(100%' }),
    animate('.6s ease-in-out', style({ opacity:'1', transform:'translateX(0)' }))
  ]),
  transition(':leave', [
    style({ opacity:'1', transform:'translateX(-100%' }),
    animate('.3s ease-in-out', style({ opacity:'0', transform:'translateX(-200px)' }))
  ])
]);
