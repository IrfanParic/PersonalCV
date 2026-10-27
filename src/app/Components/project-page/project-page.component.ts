import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs';
import { Project } from '../../Models/project';
import { ProjectService } from '../../Services/project.service';
import { scrollToSection } from '../../platform/visual-tools';

@Component({
  selector: 'app-project-page',
  templateUrl: './project-page.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class ProjectPageComponent {
  readonly project = signal<Project | undefined>(undefined);
  imageIndex = 0;
  readonly galleryOpen = signal(false);
  @ViewChild('galleryDialog') galleryDialog?: ElementRef<HTMLDialogElement>;
  private galleryTrigger?: HTMLElement;
  private swipeStart?: { id: number; x: number; y: number };
  private readonly destroyRef = inject(DestroyRef);
  private readonly scrollLifetime = new AbortController();

  constructor(route: ActivatedRoute, projectService: ProjectService) {
    this.destroyRef.onDestroy(() => {
      this.scrollLifetime.abort();
      this.closeGallery();
    });
    route.paramMap.pipe(
      switchMap(params => projectService.getProjectById(params.get('projectId') ?? '')),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(project => {
      this.closeGallery();
      this.project.set(project);
      this.imageIndex = 0;
    });
  }

  scrolltop(): void {
    void scrollToSection(0, this.scrollLifetime.signal);
  }

  openGallery(index: number, trigger: HTMLElement): void {
    const dialog = this.galleryDialog?.nativeElement;
    if (!dialog) return;
    this.imageIndex = index;
    this.galleryTrigger = trigger;
    this.galleryOpen.set(true);
    dialog.showModal();
  }

  closeGallery(): void {
    this.swipeStart = undefined;
    this.galleryOpen.set(false);
    this.galleryDialog?.nativeElement.close();
  }

  onGalleryClose(): void {
    this.swipeStart = undefined;
    this.galleryOpen.set(false);
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

  startSwipe(event: TouchEvent): void {
    const touch = event.touches[0];
    this.swipeStart = event.touches.length === 1
      ? { id: touch.identifier, x: touch.clientX, y: touch.clientY } : undefined;
  }

  endSwipe(event: TouchEvent): void {
    const start = this.swipeStart;
    this.swipeStart = undefined;
    if (!start || event.touches.length) return;
    const touch = Array.from(event.changedTouches).find(touch => touch.identifier === start.id);
    if (!touch) return;
    const horizontal = touch.clientX - start.x;
    const vertical = touch.clientY - start.y;
    if (Math.abs(horizontal) >= 40 && Math.abs(horizontal) > Math.abs(vertical) * 1.2) {
      this.changeImage(horizontal < 0 ? 1 : -1);
    }
  }

  cancelSwipe(): void {
    this.swipeStart = undefined;
  }

  technologyName(filename: string): string {
    const names: Record<string, string> = { postgree: 'PostgreSQL', googlecloud: 'Google Cloud', next: 'Next.js', nodejs: 'Node.js' };
    const name = filename.replace('_icon.png', '');
    return names[name] ?? name.charAt(0).toUpperCase() + name.slice(1);
  }
}
