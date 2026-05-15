import ListState from "./listState";

export default class ManageList {
  constructor() {
    this.listState = new ListState();
    this.BASE_URL = "http://localhost:7070";
    this.currentTicket = {};
    this.clickListeners = [];
    this.flagChange = 0;
    this.listEl = document.querySelector(".list");
    this.formEl = document.querySelector("#myForm");
    this.delFormEl = document.querySelector(".delleteForm");
    this.nameEl = document.querySelector("#description");
    this.priceEl = document.querySelector("#details");
    this.saveBtnEl = document.querySelector("#saveBtn");
    this.cancelBtnEl = document.querySelector("#cancelBtn");
    this.delNowRowEl;
    this.delBtnEl = document.querySelector("#delBtn");
    this.cancelDelBtnEl = document.querySelector("#cancelDelBtn");
    this.addGoodEl = document.querySelector(".add");
    this.actionsElArray = document.getElementsByName("actions");
    this.addGood = this.addGood.bind(this);
    this.outputGoodsList = this.outputGoodsList.bind(this);
    this.addGoodEl.addEventListener("click", () => {
      this.formEl.style.display = "block";
      let hEl = this.formEl.querySelector("h3");
      hEl.textContent = "Добавить тикет";
    });
    this.cancelBtnEl.addEventListener("click", () => {
      this.formEl.style.display = "none";
      this.nameEl.value = "";
      this.priceEl.value = "";
    });
    this.saveBtnEl.addEventListener("click", this.addGood);
    this.delBtnEl.addEventListener("click", () => {
      const id = this.delNowRowEl.dataset.id;
    
      this.deleteTicket(id).then(() => {
        this.listState.toDoArray = this.listState.toDoArray.filter(
          (item) => item.id !== id,
        );
    
        this.delNowRowEl.remove();
        this.delFormEl.style.display = "none";
      });
    });
    this.cancelDelBtnEl.addEventListener("click", () => {
      this.delFormEl.style.display = "none";
    });
  }

  loadList() {
    this.getAllTickets().then((tickets) => {
      // console.log(tickets);
      if (tickets) {
        this.listState.toDoArray = tickets;
        // console.log(this.listState.toDoArray);
        this.outputGoodsList(this.listState.toDoArray);
        this.addActListeners();
      }
    });
  }

  async getAllTickets() {
    const response = await fetch(`${this.BASE_URL}/?method=allTickets`);

    if (!response.ok) {
      throw new Error("Не удалось загрузить тикеты");
    }
    let result = await response.json();
    return result;
  }

  async getTicketById(id) {
    const response = await fetch(
      `${this.BASE_URL}/?method=ticketById&id=${id}`,
    );

    if (!response.ok) {
      throw new Error("Не удалось загрузить тикет");
    }
    let result = await response.json();
    return result;
  }

  async createTicket(ticket) {
    const response = await fetch(`${this.BASE_URL}/?method=createTicket`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ticket),
    });
    if (!response.ok) {
      throw new Error("Не удалось создать тикет");
    }
    let result = await response.json();
    return result;
  }

  async updateTicket(ticket) {
    const response = await fetch(`${this.BASE_URL}/?method=updateTicket`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ticket),
    });

    if (!response.ok) {
      throw new Error("Не удалось обновить тикет");
    }

    return response.json();
  }

  async deleteTicket(id) {
    const response = await fetch(`${this.BASE_URL}/?method=deleteTicket`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });
    if (!response.ok) {
      throw new Error("Не удалось удалить тикет");
    }
    return response.json();
  }

  async changeStatus(id) {
    const response = await fetch(`${this.BASE_URL}/?method=changeStatus`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });
    if (!response.ok) {
      throw new Error("Не удалось обновить статус");
    }
    return response.json();
  }

  addActListeners() {
    this.addEventClickListeners(this.whatToDo.bind(this));
  }

  addEventClickListeners(callback) {
    this.clickListeners.push(callback);
  }

  whatToDo(clickEl, x) {
    // console.log(clickEl);
    if (clickEl.classList.contains("status")) {
      // let elCheck = clickEl.querySelector(".round-checkbox");
      let name = clickEl.closest("tr").querySelector(".name").textContent;
      let ticket = this.listState.toDoArray.find((item) => item.name === name);
      let index = this.listState.toDoArray.findIndex(
        (item) => item.name === name,
      );
      this.changeStatus(ticket.id).then((task) => {
        console.log(task);
        this.listState.toDoArray[index].status =
          !this.listState.toDoArray[index].status;
        // console.log(this.listState.toDoArray);
      });
      return;
    }
    if (clickEl.classList.contains("name")) {
      let name = clickEl.textContent;
      let detailsEl = clickEl.querySelector(".details");
      if (detailsEl) {
        detailsEl.classList.toggle("on");
      } else {
        detailsEl = document.createElement("div");
        detailsEl.classList.add("details");
        const ticket = this.listState.toDoArray.find(
          (item) => item.name === name,
        );
        // console.log(ticket);
        let id = ticket.id;
        // console.log(id);
        this.getTicketById(id).then((task) => {
          detailsEl.textContent = task.description;
          // console.log(task.description);
          // console.log(detailsEl);
          clickEl.insertAdjacentElement("beforeend", detailsEl);
          return;
        });
      }
    }
    if (clickEl.classList.contains("actions")) {
      let rowEl = clickEl.closest("tr");
      if (x < clickEl.offsetWidth / 2) {
        let hEl = this.formEl.querySelector("h3");
        hEl.textContent = "Изменить тикет";
        this.flagChange = 1;
        this.formEl.style.display = "block";
        let det = rowEl.querySelector(".details");
        if (det) {
          this.nameEl.value = rowEl
            .querySelector(".name")
            .textContent.replace(
              rowEl.querySelector(".details").textContent,
              "",
            );
          const ticket = this.listState.toDoArray.find(
            (item) => item.name === this.nameEl.value,
          );
          let id = ticket.id;
          this.getTicketById(id).then((task) => {
            this.priceEl.value = task.description;
            this.currentTicket = task;
            // console.log(this.listState.toDoArray);
          });
        } else {
          this.nameEl.value = rowEl.querySelector(".name").textContent;
          const ticket = this.listState.toDoArray.find(
            (item) => item.name === this.nameEl.value,
          );
          let id = ticket.id;
          this.getTicketById(id).then((task) => {
            this.priceEl.value = task.description;
            this.currentTicket = task;
            console.log(this.listState.toDoArray);
          });
        }
      } else {
        this.delFormEl.style.display = "block";
        this.delNowRowEl = rowEl;
      }
    }
  }

  onActClick(event) {
    let clickEl = event.currentTarget;
    let x = event.offsetX;
    this.clickListeners.forEach((f) => f.call(null, clickEl, x));
  }

  addGood(event) {
    event.preventDefault();
    if (this.nameEl.value.trim() && this.priceEl.value.trim()) {
      // СОЗДАНИЕ НОВОГО ТИКЕТА
      if (this.flagChange === 0) {
  
        this.currentTicket.name = this.nameEl.value.trim();
        this.currentTicket.description = this.priceEl.value.trim();
  
        const timestamp = Date.now();
        const date = new Date(timestamp);
        let crDate = date.toLocaleString();
  
        this.currentTicket.created = crDate;
        this.currentTicket.status = false;
  
        // отправляем на сервер
        this.createTicket(this.currentTicket).then((task) => {
  
          // task уже содержит id от сервера
          this.listState.toDoArray.push(task);
  
          // обновляем DOM
          this.outputGoodsList(this.listState.toDoArray);
        });
  
      // ОБНОВЛЕНИЕ ТИКЕТА
      } else {
  
        this.currentTicket.name = this.nameEl.value.trim();
        this.currentTicket.description = this.priceEl.value.trim();
  
        this.updateTicket(this.currentTicket).then((task) => {
  
          // ищем тикет по id
          const index = this.listState.toDoArray.findIndex(
            (item) => item.id === task.id,
          );
  
          // заменяем старый объект новым
          this.listState.toDoArray[index] = task;
  
          // обновляем DOM
          this.outputGoodsList(this.listState.toDoArray);
  
          this.flagChange = 0;
        });
      }
  
      // очищаем форму
      this.formEl.style.display = "none";
      this.nameEl.value = "";
      this.priceEl.value = "";
  
      return;
  
    } else {
  
      let popoverEl = document.createElement("div");
  
      popoverEl.classList.add("popover");
  
      popoverEl.textContent =
        "Внимательно введите новую задачу!";
  
      this.formEl.insertAdjacentElement(
        "beforebegin",
        popoverEl,
      );
  
      setTimeout(() => {
        popoverEl.style.visibility = "hidden";
      }, 2000);
    }
  }

  outputGoodsList(array) {
    let rowArray = document.querySelectorAll(".row");
    if (rowArray) {
      for (const row of rowArray) {
        row.remove();
      }
    }
    for (const item of array) {
      // console.log(item);
      let rowEl = document.createElement("tr");
      rowEl.classList.add("row");
      rowEl.dataset.id = item.id;
      for (let index = 0; index < 4; index++) {
        let cellEl = document.createElement("td");
        switch (index) {
          case 0: {
            cellEl.classList.add("status");
            let inpEl = document.createElement("input");
            inpEl.setAttribute("type", "checkbox");
            inpEl.classList.add("round-checkbox");
            if (item.status) {
              inpEl.checked = true;
            }
            cellEl.insertAdjacentElement("afterbegin", inpEl);
            break;
          }
          case 1:
            cellEl.textContent = item.name;
            cellEl.classList.add("name");
            break;

          case 2:
            cellEl.textContent = item.created;
            cellEl.classList.add("date");
            break;
          case 3:
            cellEl.innerHTML = "&#215;";
            cellEl.setAttribute("name", "actions");
            cellEl.classList.add("actions");
            break;
        }
        cellEl.addEventListener("click", (event) => this.onActClick(event));
        rowEl.append(cellEl);
      }
      this.listEl.append(rowEl);
    }
  }
}
