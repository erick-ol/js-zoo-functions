const { species: speciesData, employees, prices, hours } = require('./data');

function getSpeciesByIds(...ids) {
  return ids.map((id) => speciesData.find((specie) => specie.id === id));
}

function getAnimalsOlderThan(animal, age) {
  return speciesData.find((specie) => specie.name === animal)
    .residents.every((resident) => resident.age > age);
}

function getEmployeeByName(employeeName) {
  if (employeeName === undefined) return {};
  return employees.find((employee) =>
    employee.firstName === employeeName || employee.lastName === employeeName);
}

function createEmployee(personalInfo, associatedWith) {
  const employee = personalInfo;
  employee.managers = associatedWith.managers;
  employee.responsibleFor = associatedWith.responsibleFor;
  return employee;
}

function isManager(id) {
  let aux = false;
  employees.forEach((employee) => {
    employee.managers.forEach((manager) => {
      if (manager === id) aux = true;
    });
  });
  return aux;
}

function addEmployee(id, firstName, lastName, managers = [], responsibleFor = []) {
  const employee = { id, firstName, lastName, managers, responsibleFor };
  employees.push(employee);
}

function countAnimals(species) {
  const speciesCount = {};
  if (species === undefined) {
    speciesData.forEach((specie) => {
      speciesCount[specie.name] = specie.residents.length;
    });
    return speciesCount;
  }
  return speciesData.find((specie) => specie.name === species).residents.length;
}

function calculateEntry(entrants) {
  if (entrants === undefined) return 0;
  if (entrants === {}) return 0;
  return Object.keys(entrants)
    .reduce((accumulator, currentValue) =>
      accumulator + (entrants[currentValue] * prices[currentValue]), 0);
}

// Feito com Pedro Trasfereti
const noOptions = 'no-options';
function createAnimalMap(option, cardinalPoints) {
  return cardinalPoints.map((cardinalPoint) => ([
    cardinalPoint,
    speciesData.filter((specie) => specie.location === cardinalPoint)
      .map((animal) => {
        const residents = animal.residents.map((resident) => resident.name);
        if (option === noOptions) return animal.name;
        if (option === 'sorted') {
          return ({ [animal.name]: residents.sort() });
        }
        return ({ [animal.name]: residents });
      }),
  ]));
}
function filterBySex(includeNames, sex, sort, cardinalPoints) {
  if (!includeNames) return createAnimalMap(noOptions, cardinalPoints);
  return cardinalPoints.map((cardinalPoint) => ([
    cardinalPoint,
    speciesData.filter((specie) => specie.location === cardinalPoint)
      .map((animal) => {
        const residents = animal.residents
          .filter((resident) => resident.sex === sex).map((resident) => resident.name);
        if (!sort) return ({ [animal.name]: residents });
        return ({ [animal.name]: residents.sort() });
      }),
  ]));
}
function getAnimalMap(options) {
  const cardinalPoints = ['NE', 'NW', 'SE', 'SW'];
  if (!options) return Object.fromEntries(createAnimalMap(noOptions, cardinalPoints));
  if (options.sex) {
    return Object.fromEntries(
      filterBySex(options.includeNames, options.sex, options.sorted, cardinalPoints),
    );
  }
  if (options.sorted) {
    return Object.fromEntries(createAnimalMap('sorted', cardinalPoints));
  }
  return Object.fromEntries(createAnimalMap('include-names', cardinalPoints));
}

function getSchedule(dayName) {
  const arrayHours = Object.entries(hours).map((hour) => {
    if (hour[1].open !== 0) {
      return [hour[0], `Open from ${hour[1].open}am until ${hour[1].close - 12}pm`];
    }
    return [hour[0], 'CLOSED'];
  });
  if (dayName === undefined) {
    return Object.fromEntries(arrayHours);
  }
  return Object.fromEntries(arrayHours.filter((hour) => hour[0] === dayName));
}

function getOldestFromFirstSpecies(id) {
  const idAnimal = employees.find((employee) => employee.id === id).responsibleFor[0];
  let maxAge = 0;
  speciesData.find((specie) => specie.id === idAnimal).residents
    .forEach((resident) => {
      if (maxAge < resident.age) maxAge = resident.age;
    });
  return Object.values(speciesData.find((specie) => specie.id === idAnimal)
    .residents.find((resident) => resident.age === maxAge));
}

function increasePrices(percentage) {
  Object.keys(prices).forEach((key) => {
    prices[key] = Math.round((prices[key] * ((percentage / 100) + 1) * 100)) / 100;
  });
}

function getEmployeeCoverage(idOrName) {
  const employeeObject = {};
  if (idOrName === undefined) {
    employees.forEach((employee) => {
      employeeObject[`${employee.firstName} ${employee.lastName}`] = employee.responsibleFor
        .map((animal) => speciesData.find((specie) => specie.id === animal).name);
    });
  }
  if (idOrName) {
    const employeeData = employees.find((employee) =>
      (employee.id === idOrName)
      || employee.firstName === idOrName
      || employee.lastName === idOrName);
    employeeObject[`${employeeData.firstName} ${employeeData.lastName}`] = (
      employeeData.responsibleFor.map((animal) => speciesData
        .find((specie) => specie.id === animal).name));
  }

  return employeeObject;
}
console.log(getEmployeeCoverage('4b40a139-d4dc-4f09-822d-ec25e819a5ad'));

module.exports = {
  calculateEntry,
  getSchedule,
  countAnimals,
  getAnimalMap,
  getSpeciesByIds,
  getEmployeeByName,
  getEmployeeCoverage,
  addEmployee,
  isManager,
  getAnimalsOlderThan,
  getOldestFromFirstSpecies,
  increasePrices,
  createEmployee,
};
