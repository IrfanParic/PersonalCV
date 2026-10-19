import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class AboutComponent {
  readonly technologies = [
    { name: 'Figma', icon: 'figma' },
    { name: 'React', icon: 'react' },
    { name: 'Angular', icon: 'angular' },
    { name: 'Vue', icon: 'vue' },
    { name: 'Node.js', icon: 'nodejs' },
    { name: 'Spring Boot', icon: 'spring' },
    { name: 'MySQL', icon: 'mysql' },
    { name: 'PostgreSQL', icon: 'postgree' }
  ];
}
