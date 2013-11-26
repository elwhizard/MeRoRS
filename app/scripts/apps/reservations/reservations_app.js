define(["app"], function(MERORS){
  MERORS.module("ReservationsApp", function(ReservationsApp, MERORS, Backbone, Marionette, $, _){
    ReservationsApp.startWithParent = false;
    console.log('reservations app')
    ReservationsApp.onStart = function(){
      console.log("starting ReservationsApp");
    };

    ReservationsApp.onStop = function(){
      console.log("stopping ReservationsApp");
    };
  });

  MERORS.module("Routers.ReservationsApp", function(ReservationsAppRouter, MERORS, Backbone, Marionette, $, _){
    ReservationsAppRouter.Router = Marionette.AppRouter.extend({
      appRoutes: {
        "reservations(/filter/criterion::criterion)": "mainReservations",
        "reservations/:id": "showReservation",
        "reservations/:id/edit": "editReservation"
      }
    });

    var executeAction = function(action, arg){
      MERORS.startSubApp("ReservationsApp");
      action(arg);
      MERORS.execute("set:active:header", "reservations");
    };

    var API = {

      mainReservations: function (criterion) {
        require(["app/reservations/main/main_controller"], function (MainController) {
          console.log('api')
          console.log(MainController)
          executeAction(MainController.mainView, criterion);
        });
      }, 
      // Shows the description of a reservation
      showReservation: function (id) {

      }, 
      // Edit a reservation
      editReservation: function (id) {

      }
    };

    // Listeners for our routes
    MERORS.on("reservations:main", function(){
      MERORS.navigate("reservations");
      API.mainReservations();
    });

    MERORS.on("reservations:filter", function(criterion){
      if(criterion){
        MERORS.navigate("reservations/filter/criterion:" + criterion);
      }
      else{
        MERORS.navigate("reservations");
      }
    });

    MERORS.addInitializer(function(){
      new ReservationsAppRouter.Router({
        controller: API
      });
    });
  });

  return MERORS.ReservationsAppRouter;
});
