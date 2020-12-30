import { Component, h } from '@stencil/core';

@Component({
  tag: 'app-root',
})
export class AppRoot {
  render() {
    return (
      <ion-app>
        <ion-router useHash={false}>
          <ion-route-redirect from="/" to="/home" />
          <ion-route url="/home" component="tab-home"></ion-route>
          <ion-route url="/humigadget" component="tab-humigadget"></ion-route>
          <ion-route url="/scan" component="tab-scan"></ion-route>
          <ion-route url="/test" component="tab-test"></ion-route>
        </ion-router>
        <ion-tabs>
          <ion-tab tab="tab-home" component="app-home"></ion-tab>
          <ion-tab tab="tab-humigadget" component="app-humigadget"></ion-tab>
          <ion-tab tab="tab-scan" component="app-scan"></ion-tab>
          <ion-tab tab="tab-test" component="app-test"></ion-tab>
          <ion-tab-bar slot="bottom">
            <ion-tab-button tab="tab-home">
              <ion-icon name="heart-circle-outline"></ion-icon>
            </ion-tab-button>
            <ion-tab-button tab="tab-humigadget">
              <ion-icon name="thermometer-outline"></ion-icon>
            </ion-tab-button>
            <ion-tab-button tab="tab-scan">
              <ion-icon name="list-circle-outline"></ion-icon>
            </ion-tab-button>
            <ion-tab-button tab="tab-test">
              <ion-icon name="checkmark-done-outline"></ion-icon>
            </ion-tab-button>
          </ion-tab-bar>
        </ion-tabs>
      </ion-app>
    );
  }
}
