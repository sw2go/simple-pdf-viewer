import { Component, ViewChild } from '@angular/core';
import { SimplePdfViewerComponent } from '../../libs/simple-pdf-viewer/src/simplePdfViewer.component';
import { SimpleProgressData, SimplePDFBookmark } from '../../libs/simple-pdf-viewer/src/simplePdfViewer.models';
import { ViewerComponent } from './app.viewer';
import { Observable } from 'rxjs/Observable';

const OUTLINE_MENU = 2;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  src: string = 'assets/example/pdf-test.pdf';
  menu = 1;
  backButtonVisible = false;
  errorMsg = '';
  bookmarks: SimplePDFBookmark[] = [];
  snapshots: string[] = [];
  displayedImage: string = '';

  urlBox: any;
  firstPageBox: any;
  firstZoomBox: any;
  pageBox: any;
  zoomBox: any;
  searchBox: any;


  lastDblKlick: string;

  @ViewChild(SimplePdfViewerComponent) private pdfViewer: SimplePdfViewerComponent;
  @ViewChild(ViewerComponent) private imgViewer: ViewerComponent;

  isActiveMenu(menu: number): boolean {
    return this.menu === menu && (this.pdfViewer.isDocumentLoaded() || menu === 1);
  }

  setActiveMenu(menu: number) {
    this.menu = menu;
    if(menu == OUTLINE_MENU) {
      this.backButtonVisible = true;
    } else {
      this.backButtonVisible =false;
    }
  }

  openDocument(documents: File[]) {
    this.errorMsg = '';
    if (documents && documents.length > 0) {
      this.pdfViewer.openFile(documents[0]);
    }
  }

  openUrl(url: string) {
    this.errorMsg = '';
    if (url && url.length > 0) {
      this.pdfViewer.openUrl(url);
    }
  }

  onError(event: any) {
    this.errorMsg = 'Failed to load the document';
  }

  onProgress(progress: SimpleProgressData) {
    console.log(progress);
  }

  onLoadComplete()  {
    console.log('Document is loaded');
    // see the whole document
    this.pdfViewer.zoomFullPage();
  }

  createBookmark() {
    this.pdfViewer.createBookmark().then(bookmark => {
      if(bookmark) {
        this.bookmarks.push(bookmark);
      }
    })
  }

  getPageSnapshot() {
    this.pdfViewer.getPageSnapshot().then(snapshot => {
      if(snapshot) {
        this.snapshots.push(URL.createObjectURL(snapshot));
      }
    })
  }

  openImage(url: string) {
    this.displayedImage = url;
    this.imgViewer.show();
    //window.open(url);
  }

  saveBookmarks(aElementRef: any ) {

    let data = { marks: this.bookmarks };
    let json = JSON.stringify(data);
    let blob = new Blob([json], {type: "application/json"});
    aElementRef.href = URL.createObjectURL(blob);
  }

  loadBookmarks(file: File) {

    readFile(file).subscribe(str => {

      let data: { marks: SimplePDFBookmark[] } = JSON.parse(str);

      data.marks.forEach(b => {
        let bookmark = new SimplePDFBookmark(b.page, b.zoom, b.rotation, b.x, b.y);
        this.bookmarks.push(bookmark);        
      });    
    }, e => console.log(e));

    
  }

  doubleKlick(v: any) {
    this.lastDblKlick = v.target.innerHTML;
    console.log("innerHtml:" + v.target.innerHTML);
  }


}


const readFile = (blob: Blob): Observable<string> => Observable.create(obs => {
  if (!(blob instanceof Blob)) {
    obs.error(new Error('`blob` must be an instance of File or Blob.'));
    return;
  }

  const reader = new FileReader();
  reader.onerror = err => obs.error(err);
  reader.onabort = err => obs.error(err);
  reader.onload = () => obs.next(reader.result);
  reader.onloadend = () => obs.complete();
  return reader.readAsText(blob);
});
