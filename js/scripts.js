const Modal = {
    open(){
        document.querySelector('.modal-overlay').classList.add('active');
    },
    close(){
        document.querySelector('.modal-overlay').classList.remove('active');
    }
};

const Storage={
    get(){
        return JSON.parse(localStorage.getItem('dev.finance:transactions')) || [];
    },
    set(){
        localStorage.setItem('dev.finance:transactions', JSON.stringify(Transaction.all));
    }
};

const Transaction = {
    all:Storage.get(),
    add(transaction){
        Transaction.all.push(transaction);

        App.reload();
    },
    incomes(){
       let income=0;
       
       Transaction.all.forEach(transaction => {
            if(transaction.amount>0){
                income = income + transaction.amount; 
            }
       });

       return income;
    },
    expenses(){
        let expense = 0;

        Transaction.all.forEach(transaction => {
            if(transaction.amount<0){
                expense = expense + transaction.amount; 
            }
       });

       return expense;
    },
    remove(index){
        Transaction.all.splice(index, 1);

        App.reload();
    },
    total(){
       return Transaction.incomes() + Transaction.expenses();
    }
};

const Utils = {
    formatAmount(val){
        return Number(val) * 100;
    },
    formatCurrency(val){
        const signal = Number(val) < 0 ? '-' : '';

        val = String(val).replace(/\D/g, "");

        val = Number(val) / 100;

        val = val.toLocaleString("pt-BR",{
            style:'currency',
            currency:'BRL'
        });

        return `${signal} ${val}`;
    },
    formatDate(val){
       const arr = val.split('-');

       return `${arr[2]}/${arr[1]}/${arr[0]}`;
    }
};

const DOM = {
    transactionContainer: document.querySelector('#data-table tbody'),
    addTransaction(transaction, index){        
        const tr = document.createElement('tr');

        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
        tr.dataset.index = index;

        DOM.transactionContainer.appendChild(tr);
    },
    cleanTransaction(){
        document.querySelector('#data-table tbody').innerHTML='';
    },
    innerHTMLTransaction(transaction, index){
        const CSSclass = transaction.amount > 0 ? 'income' : 'expense';
        
        const html = `
            <td>${transaction.description}</td>
            <td class="${CSSclass}">${Utils.formatCurrency(transaction.amount)}</td>
            <td>${transaction.date}</td>
            <td><img src="./assets/minus.svg" onclick="Transaction.remove(${index});" alt="Remover" ></td>`;

        return html;
    },
    updateBalance(){
        document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes());
        document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(Transaction.expenses());
        document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total());
    }
};

const Form = {
    date:document.getElementById('date'),
    amount:document.getElementById('amount'),
    description:document.getElementById('description'),
    getValues(){
        return {
           date:Form.date.value, 
           amount:Form.amount.value,
           description:Form.description.value
        };
    },
    validateFields(){
        const {date, amount, description} = Form.getValues();

        if(date.trim()==="" || amount.trim()==="" || description.trim()===""){
            throw new Error("Por favor, preencha todos os campos");
        }
    },    
    formatValues(){
        let {description, amount, date} = Form.getValues();

        return {description:description, amount:Utils.formatAmount(amount), date:Utils.formatDate(date)};
    },
    clearFilelds(){
        Form.date.value = "";
        Form.amount.value = "";
        Form.description.value = "";
    },
    submit(event){
        event.preventDefault();

        try{
            Form.validateFields();
            const transaction = Form.formatValues();

            Transaction.add(transaction);
            Form.clearFilelds();
            Modal.close();
        }catch(error){
            alert(error.message);
        }

    }
};

const App={
    init(){
        for(const i in Transaction.all){
            DOM.addTransaction(Transaction.all[i], i);
        }
        
        DOM.updateBalance();

        Storage.set();
    },
    reload(){
        DOM.cleanTransaction();
        App.init();
    }
};

App.init();