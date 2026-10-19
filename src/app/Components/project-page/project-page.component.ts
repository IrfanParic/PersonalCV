import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs';
import { Project } from '../../Models/project';
import { ProjectService } from '../../Services/project.service';

@Component({
  selector: 'app-project-page',
  templateUrl: './project-page.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class ProjectPageComponent {
  readonly project = signal<Project | undefined>(undefined);
  imageIndex = 0;
  @ViewChild('galleryDialog') galleryDialog?: ElementRef<HTMLDialogElement>;
  private galleryTrigger?: HTMLElement;
  private readonly destroyRef = inject(DestroyRef);

  constructor(route: ActivatedRoute, projectService: ProjectService) {
    route.paramMap.pipe(
      switchMap(params => projectService.getProjectById(params.get('projectId') ?? '')),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(project => {
      this.closeGallery();
      this.project.set(project);
      this.imageIndex = 0;
    });
  }

  openGallery(index: number, trigger: HTMLElement): void {
    this.imageIndex = index;
    this.galleryTrigger = trigger;
    this.galleryDialog?.nativeElement.showModal();
  }

  closeGallery(): void {
    this.galleryDialog?.nativeElement.close();
  }

  restoreFocus(): void {
    this.galleryTrigger?.focus();
    this.galleryTrigger = undefined;
  }

  changeImage(offset: number): void {
    const next = this.imageIndex + offset;
    const project = this.project();
    if (project && next >= 0 && next < project.gallery.length) {
      this.imageIndex = next;
    }
  }

  technologyName(filename: string): string {
    const names: Record<string, string> = { postgree: 'PostgreSQL', googlecloud: 'Google Cloud', next: 'Next.js', nodejs: 'Node.js' };
    const name = filename.replace('_icon.png', '');
    return names[name] ?? name.charAt(0).toUpperCase() + name.slice(1);
  }
}
