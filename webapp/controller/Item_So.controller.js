sap.ui.define([
    "sap/ui/core/mvc/Controller", 'sap/m/MessageToast', 
    'sap/ui/model/Filter', "sap/ui/model/FilterOperator"

], (Controller, MessageToast, Filter, FilterOperator) => {
    "use strict";

    return Controller.extend("emergencyso.emergencyso.controller.Item_So", {
        onInit() {

            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteitemSo").attachPatternMatched(this.onRouteMatched, this);

            //엔터 이벤트
            this.getView().byId("VbelnSo1").attachBrowserEvent("keypress", function (event) {
                if (event.key === "Enter") { 
                    this.onSearch();
                }
              }.bind(this));
        },
        onRouteMatched: function(oEvent) {
            const sVbelnSo = oEvent.getParameter("arguments").VbelnSo;  // 넘어온 VbelnSo 파라미터
            const oTable = this.getView().byId("DocuTable2");           // 상세페이지 테이블 ID
            const oBinding = oTable.getBinding("rows");
        
            if (sVbelnSo) {
                const oFilter = new sap.ui.model.Filter("VbelnSo", sap.ui.model.FilterOperator.EQ, sVbelnSo);
                oBinding.filter([oFilter]);
            }
        },
        onHeader() {

            let oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteHeaderView");
        },
        onDefine(){
            this.getView().byId('Matnr').setValue('');
            this.getView().byId('Pequan').setValue(''); 
            this.getView().byId('Stprs').setValue(''); 
            this.getView().byId('Waers').setValue('');
            this.getView().byId('Menge').setValue('');
            this.getView().byId('VbelnSo').setValue('');
            this.getView().byId('Partner').setValue('');
        },
        onSearch(){ // 검색기능
            let vVbelnSo  =  this.getView().byId('VbelnSo1').getValue('');
  
            let otable   = this.getView().byId('DocuTable2'), //테이블 받아오기
                oBinding = otable.getBinding('rows'), //검색 객체
                oFilter  = null, //검색어를 구성하는 객체
                aFilter  = []; //검색어를 받을 배열
  
                //Filter 구성
                if(vVbelnSo!= ''){
                  oFilter = new Filter({
                      path: 'VbelnSo' ,
                      operator: FilterOperator.Contains, //검색 값 포함하는 것 렌더링
                      value1: vVbelnSo
                  });
  
                  aFilter.push(oFilter);
                  oFilter = null;
                }
                
                oBinding.filter(aFilter);

                oBinding.refresh(); // 💡 추가

                // 확인 로그
                // console.log("Current filter:", oBinding.getFilters());
                // console.log("Filtered row count (may be async):", oBinding.getLength());
                // console.log("입력된 판매오더번호:", aFilter);
          }, 
          onInputChanged: function (oEvent) { //사용자가 검색 input 비울 시 전체 데이터 렌더링
            const sValue = oEvent.getParameter("value").trim();
            const oTable = this.getView().byId("DocuTable2");
            const oBinding = oTable.getBinding("rows");
        
            if (sValue === "") {
                oBinding.filter([]);       // 전체 데이터 보여주기
                oBinding.refresh(true);    // 서버에서 다시 가져오기
            }
        },
          onInputChanged2: function (oEvent) {
            const sValue = oEvent.getParameter("value").trim();
            const oTable = this.getView().byId("DocuTable2");
            const oBinding = oTable.getBinding("rows");
        
            if (sValue === "") {
                oBinding.filter([]);       // 전체 데이터 보여주기
                oBinding.refresh(true);    // 서버에서 다시 가져오기
            }
        }
    
    });
});