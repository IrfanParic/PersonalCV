import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-project-page',
  templateUrl: './project-page.component.html',
  styleUrls: ['./project-page.component.css']
})
export class ProjectPageComponent implements OnInit {
  recievedData: any;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    // Accessing data from the route
    this.recievedData = this.route.snapshot.data;
    console.log(this.recievedData)

    // Use receivedData as needed
  }

}
