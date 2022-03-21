class Entity {
  constructor() {
    this.id = this.generateId();
  }

  /**
   * Generate random id, a-z,0-9
   * @returns {string} Random id
   */
  generateId() {
    return Math.random().toString(16).slice(8);
  }
}

class Household extends Entity {
  constructor() {
    super();
    this.powerPlantConnections=[];
    this.chargingFromHouseholds=[];
  }

  /**
   * Connect current household to given power plant
   *  @param {PowerPlant} powerPlant - power plant to connect
   */
  connectToPowerPlant(powerPlant){
    this.powerPlantConnections.push(powerPlant);
    powerPlant.connectedHouseholds.push(this);
  }

  /**
   * Check households power plants and households connections recursively
   *  @param {string} mainHouseholdId - id of household from which search started
   *  @param {array} households - households to check
   *  @param {array} recursionArray - array which contains id of households function already checked, fills up recursively
   *  @returns {boolean} Electricity status
   */
  checkHouseholdsStatus(mainHouseholdId, households, recursionArray = [mainHouseholdId]){
    const result = households.filter(innerHousehold => {
      const recursionArrayFilter = recursionArray.filter(recItem=>{
        return recItem === innerHousehold.id;
      });

      //Stop recursion if household connection array contains something we already check
      if (recursionArrayFilter.length){
        return false;
      }

      const activePlants = innerHousehold.powerPlantConnections.filter(plant => {
        return plant.isActive;
      })

      if (activePlants.length){
        return true;
      }else if(innerHousehold.chargingFromHouseholds.length) {
        return this.checkHouseholdsStatus(mainHouseholdId, innerHousehold.chargingFromHouseholds, [...recursionArray, innerHousehold.id]);
      }
    });

    return !!result.length;
  }

  /**
   * Check it`s power plants and households connections
   *  @returns {boolean} Electricity status
   */
  getElectricityStatus(){
    const activePlants = this.powerPlantConnections.filter(plant => plant.isActive)
    if (activePlants.length){ // If direct connection
      return true;
    }else if(this.chargingFromHouseholds.length) {
      return this.checkHouseholdsStatus(this.id, this.chargingFromHouseholds);
    } else {
      return false;
    }
  }

  /**
   * Connect current household to given household
   *  @param {Household} household - household to connect
   */
  connectToHousehold(household){
    this.chargingFromHouseholds.push(household);
  }

  /**
   * Disconnect current household from given power plant
   *  @param {PowerPlant} powerPlant - power plant to disconnect
   */
  disconnectFromPowerPlant(powerPlant){
    this.powerPlantConnections = this.powerPlantConnections.filter(item => item !== powerPlant);
    powerPlant.connectedHouseholds = powerPlant.connectedHouseholds.filter(item => item !== this);
  }
}

class PowerPlant extends Entity {
  constructor() {
    super();
    this.isActive = true;
    this.connectedHouseholds = []; // Just technical field for debug
  }

  /**
   * Set power plant isActive flag to false
   */
  activate(){
    this.isActive = true;
  }

  /**
   * Set power plant isActive flag to true
   */
  deactivate(){
    this.isActive = false;
  }
}

export class World {
  constructor() {
    this.powerPlants = []; // Do not use it in app, but think that it will be useful to store this information for future functionality development
    this.households = []; // This too
  }

  /**
   * Create new power plant
   *  @returns {PowerPlant} New power plant
   */
  createPowerPlant() {
    const powerPlant = new PowerPlant();
    this.powerPlants.push(powerPlant);
    return powerPlant;
  }

  /**
   * Create new household
   *  @returns {Household} New household
   */
  createHousehold() {
    const household = new Household();
    this.households.push(household);
    return household;
  }

  /**
   * Add household to power plant dependency array
   * @param {Household} household - connecting household
   * @param {PowerPlant} powerPlant - power plant to connect
   */
  connectHouseholdToPowerPlant(household, powerPlant) {
    household.connectToPowerPlant(powerPlant);
  }

  /**
   * Energize household from household
   * @param {Household} household1 - household consumer
   * @param {Household} household2 - household source
   */
  connectHouseholdToHousehold(household1, household2) {
    if (household1.id !== household2.id){
      const alreadyCharging = household1.chargingFromHouseholds.filter(item => item.id === household2.id);
      if (!alreadyCharging.length){
        household1.connectToHousehold(household2);
      }
    }
  }

  /**
   * Remove household from power plant dependency array
   * @param {Household} household - household for disconnect
   * @param {PowerPlant} powerPlant - entity disconnect from
   */
  disconnectHouseholdFromPowerPlant(household, powerPlant) {
    household.disconnectFromPowerPlant(powerPlant);
  }

  /**
   * Change power plant isActive flag to false
   * @param {PowerPlant} powerPlant - entity to deactivate
   */
  killPowerPlant(powerPlant) {
    powerPlant.deactivate();
  }

  /**
   * Change power plant isActive flag to true
   * @param {PowerPlant} powerPlant - entity to activate
   */
  repairPowerPlant(powerPlant) {
    powerPlant.activate();
  }

  /**
   * Get the household electricity status. Search in it powerplants and households dependencies.
   * @param {Household} household - entity to check
   * @returns {boolean} Electricity status
   */
  householdHasEletricity(household) {
    return household.getElectricityStatus();
  }
}