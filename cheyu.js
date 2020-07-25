//BudgetController (tous les methodes par rapport aux budget )

var BudgetController = (function(){


    var Income = function(id,description,value){
        this.id= id;        
        this.description= description;
        this.value = value;
    }; 

    var Expense= function(id,description,value){
        this.id= id;
        this.description= description;
        this.value = value;       
        this.percentage=-1;
    };
    Expense.prototype.calcPercentage=function(totalIncome){
        if(totalIncome>0){
            this.percentage=Math.round((this.value/totalIncome)*100);
        }else{
            this.percentage=-1;
        }
    };
    Expense.prototype.getPercentage=function(){
        return this.percentage;
    };
    var calculateTotal = function(type){
        var sum=0;
        data.allItems[type].forEach(function(cur){
          sum = sum+cur.value;
        });
        data.totals[type]=sum;
  
      };
    
    var data ={
        allItems:{
        inc:[],
        exp:[]
    },
       totals:{
        exp:0,
        inc:0
    },
    budget:0,
    percentage:-1
};

return{
    addItem:function(type,des,val){
        var newItem,ID;
        ID =0;
        //create new ID
        if(data.allItems[type].length>0){
            ID= data.allItems[type][data.allItems[type].length-1].id+1;
        }else{
            ID =0;
        }
       // create new item based on 'inc' or 'exp' type
        if(type==='exp'){
            newItem= new Expense(ID,des,val);
    }else if (type==='inc') {
             newItem = new Income(ID,des,val);
    }
    data.allItems[type].push(newItem);
    return newItem;
},
deleteItem:function(type,id){
    var ids,index;
    var ids=data.allItems[type].map(function(current){
        return current.id;
    });

    index=ids.indexOf(id);

    if(index !== -1){
        data.allItems[type].splice(index,1);
    }

},
calculateBudget:function(){
 // calculate total income and expenses
 calculateTotal('exp');
 calculateTotal('inc');
 
 // calculate the budget: income-expenses
data.budget = data.totals.inc-data.totals.exp;

 // calculate the precentage : total expenses/total incomes
 if(data.totals.inc>0){
    data.percentage =Math.round((data.totals.exp/data.totals.inc)*100);
 }else{
     data.percentage=-1;
 }
},

calculatePercentages:function(cur){


    data.allItems.exp.forEach(function(cur){
        cur.calcPercentage(data.totals.inc);
    });
},
getPercentages:function(){
   
var allPerc= data.allItems.exp.map(function(cur){

 return cur.getPercentage();
}); 
return allPerc;

},

getBudget: function(){
    return {
        budget:data.budget,
        totalInc:data.totals.inc,
        totalExp:data.totals.exp,
        percentage: data.percentage
        
    }
},
  testing :function(){
      console.log(data);
  }
};

})();

// UIController (affichage sur le utilisateur interface )
var UIController =(function(){
    var DOMstrings ={
        inputType:'.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn:'.add__btn',
        incomeContanier:'.income__list',
        expensesContainer:'.expenses__list',
        budgetLabel:'.budget__value',
        incomeLabel:'.budget__income--value',
        expensesLabel:'.budget__expenses--value',
        percentageLabel:'.budget__expenses--percentage',
        container:'.container',
        expensesPercLabel:'.item__percentage',
        dateLabel:'.budget__title--month'
    };
    var formatNumber= function(num,type){
        var numSplit,int,dec,type;
        /*
        + or -before number
        exactly 2 decimal points
        comma separating the thousands
        */
       num = Math.abs(num);
       num = num.toFixed(2);
       numSplit = num.split('.');
       int = numSplit[0];
      
       if(int.length>3){
           int = int.substr(0,int.length-3)+','+int.substr(int.length-3,3); // input 1234,output 1,234
       }
       dec = numSplit[1];
       return (type==='exp'? '-':'+')+''+int+'.'+dec;
    };
    var nodeListForEach = function(list,callback){
        for (var i=0;i<list.length;i++){
            callback(list[i],i); 
        }
    };
return {

    getInput: function(){
        return{
             type: document.querySelector(DOMstrings.inputType).value,
             description : document.querySelector(DOMstrings.inputDescription).value,
             value : parseFloat(document.querySelector(DOMstrings.inputValue).value),

        };    
    },
    addListItem: function(obj,type){// obj-newItem in cotroller
        var html,newHtml,element;
        //create HTML string with placeholder text
        if(type==="inc"){
            element = DOMstrings.incomeContanier;
            html=`<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div>
            <div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete">
           <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>`;
        }else if (type==="exp"){
            element= DOMstrings.expensesContainer;
       html=`<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div>
       <div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div>
           <div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
           </div></div></div>`;
                
        } 
        //repalce the placeholder text with some actual data
        newHtml= html.replace('%id%',obj.id);
        newHtml= newHtml.replace('%description%',obj.description);
        newHtml= newHtml.replace('%value%',formatNumber(obj.value,type));
        // in cert the html into the DOM
        document.querySelector(element).insertAdjacentHTML("beforeend",newHtml);
      
    },
    deleteListItem:function(selectorId){
        var el=document.getElementById(selectorId);
        el.parentNode.removeChild(el);

    },
  clearFields: function(){
        var fields,fieldsArray;
        fields=document.querySelectorAll(DOMstrings.inputDescription+','+DOMstrings.inputValue);
        fieldsArray=Array.prototype.slice.call(fields);
        fieldsArray.forEach(function(current,index,array){
            current.value="";      

        });
        fieldsArray[0].focus();

    },
    displayBudget: function(obj){
        var type;
        obj.budget>0 ?type ='inc':type='exp';
     document.querySelector(DOMstrings.budgetLabel).textContent= formatNumber(obj.budget,type);
     document.querySelector(DOMstrings.incomeLabel).textContent=formatNumber(obj.totalInc,'inc');
     document.querySelector(DOMstrings.expensesLabel).textContent=formatNumber(obj.totalExp,'exp');
     if(obj.percentage>0){
        document.querySelector(DOMstrings.percentageLabel).textContent=obj.percentage+'%';
     }else{
        document.querySelector(DOMstrings.percentageLabel).textContent='---';   }  

       
    },
    displayPercentages:function(percentages){
        var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
    
      var nodeListForEach = function(list,callback){
            for (var i=0;i<list.length;i++){
                callback(list[i],i); 
            }
        };
        nodeListForEach(fields,function(current,index){
           if (percentages[index]>0){
               current.textContent= percentages[index]+'%';
           }else{
               current.textContent='---';
           }
        });
    
    },
     displayMonth:function(){

        var now,month,months,year;
        months =['Jaunary','February','March','April','May','June','July','August','September','October','November','December' ];
        now= new Date();
        month= now.getMonth();
        year = now.getFullYear();
 
         document.querySelector(DOMstrings.dateLabel).textContent=months[month]+' '+year;
                
     },
     changedType:function(){
      var fields =document.querySelectorAll(
          DOMstrings.inputType+','+DOMstrings.inputDescription+','+DOMstrings.inputValue);

      nodeListForEach(fields,function(cur){
          cur.classList.toggle('red-focus');
          document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
      });



     },
    getDOMstrings: function(){
        return  DOMstrings;
    }
};


})();



//App global controller 
var controller=(function(budgetCtrl,UICtrl){

 var setupEventListeners =function(){
    var DOM = UICtrl.getDOMstrings();
document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);


document.addEventListener('keypress',function(event){
    if(event.keycode ===13 || event.which ===13){
        ctrlAddItem();
    }
});
document.querySelector(DOM.container).addEventListener('click',CtrlDeteleItem);
document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changedType);

};
var updateBudget = function(){
       //1.Calculate the budget
       budgetCtrl.calculateBudget();
       //2.return the budget 
        var budget= BudgetController.getBudget();
    //3.Display the budget on the UI 
        UICtrl.displayBudget(budget);

};
var updatePercentage = function(){
    //1.calculate the percentage
    budgetCtrl.calculatePercentages();
    //2.read the percentage
    var percentages=budgetCtrl.getPercentages();
    //3.update the percentage
    UICtrl.displayPercentages(percentages);

}

  
    var ctrlAddItem = function(){

        var input,newItem,
      //1.get the field input data
      input = UICtrl.getInput();

      if (input.description != "" && input.value != isNaN && input.value>0){
    //2. add the item to the budget controller
     newItem= budgetCtrl.addItem(input.type,input.description,input.value);
     //3.add the item to the UI
      UICtrl.addListItem(newItem,input.type);
      //4.clear the fields
      UICtrl.clearFields();
      //5.Calculate and update budget
      updateBudget();
      //6.calculate and update percentages
      updatePercentage();
      
      }
   
 
    };
    var CtrlDeteleItem = function(event){
        var itemID,ID;
     itemID= event.target.parentNode.parentNode.parentNode.parentNode.id;
     if(itemID){
         //inc-1
         splitID= itemID.split('-');
         type=splitID[0];
         ID= parseInt(splitID[1]);
         //1.delete the item from the data structure
         budgetCtrl.deleteItem(type,ID);
         //2.delete the item from the UI
         UICtrl.deleteListItem(itemID);
         //3.update and  show the new budget
         updateBudget();
     }
    };
    
    return {
        init: function(){
            console.log('Application has started');
            UICtrl.displayBudget({
                budget:0,
                totalInc:0,
                totalExp:0,
                percentage:-1
            });         
            UICtrl.displayMonth();

            setupEventListeners();
        }
    };
  

})(BudgetController,UIController);

controller.init();

