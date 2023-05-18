import { Component, Input, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-imagestack',
  templateUrl: './imagestack.component.html',
  styleUrls: ['./imagestack.component.scss']
})
export class ImagestackComponent implements OnInit {
  unstacked = false;
  images$ = new Observable<string[]>();
  @Input() width = "64px";
  @Input() imagelist: string[] = [];
  @Input() tooltip = "";

  ngOnInit(): void {
    this.images$ = of(this.imagelist).pipe(
      map(l => l.filter(this.distinct).slice(0, 5))
    );
  }

  distinct = (v: any, i: number, s: any) => s.indexOf(v) === i;

  enter(): void {
    this.unstacked = true;
  }
  leave(): void {
    this.unstacked = false;
  }
}
