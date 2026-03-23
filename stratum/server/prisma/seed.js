const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const SENSORS = [
  // TEMPERATURE: 4 sensors
  { name: "Temp Sensor Alpha", type: "TEMPERATURE", location: "Server Room", floor: 1, zone: "Zone A", posX: 20, posY: 30, unit: "°C", minThreshold: 15, maxThreshold: 30, model: "DS18B20-PRO", firmware: "v2.4.1" },
  { name: "Temp Sensor Beta",  type: "TEMPERATURE", location: "Office A",    floor: 1, zone: "Zone B", posX: 45, posY: 25, unit: "°C", minThreshold: 18, maxThreshold: 28, model: "DS18B20-PRO", firmware: "v2.4.1" },
  { name: "Temp Sensor Gamma", type: "TEMPERATURE", location: "Office B",    floor: 2, zone: "Zone A", posX: 55, posY: 40, unit: "°C", minThreshold: 18, maxThreshold: 28, model: "DS18B20-PRO", firmware: "v2.4.1" },
  { name: "Temp Sensor Delta", type: "TEMPERATURE", location: "Reception",   floor: 1, zone: "Zone C", posX: 75, posY: 60, unit: "°C", minThreshold: 16, maxThreshold: 26, model: "DS18B20-PRO", firmware: "v2.4.1" },

  // HUMIDITY: 4 sensors
  { name: "Humidity Node 01", type: "HUMIDITY", location: "Server Room", floor: 1, zone: "Zone A", posX: 22, posY: 35, unit: "%", minThreshold: 30, maxThreshold: 70, model: "DHT22-IOT", firmware: "v1.8.3" },
  { name: "Humidity Node 02", type: "HUMIDITY", location: "Storage",     floor: 1, zone: "Zone D", posX: 85, posY: 20, unit: "%", minThreshold: 25, maxThreshold: 65, model: "DHT22-IOT", firmware: "v1.8.3" },
  { name: "Humidity Node 03", type: "HUMIDITY", location: "Lab",         floor: 2, zone: "Zone B", posX: 40, posY: 55, unit: "%", minThreshold: 35, maxThreshold: 60, model: "DHT22-IOT", firmware: "v1.8.3" },
  { name: "Humidity Node 04", type: "HUMIDITY", location: "Corridor",    floor: 2, zone: "Zone C", posX: 65, posY: 70, unit: "%", minThreshold: 30, maxThreshold: 75, model: "DHT22-IOT", firmware: "v1.8.3" },

  // ENERGY: 4 sensors
  { name: "Power Monitor Main", type: "ENERGY", location: "Main Panel",    floor: 1, zone: "Utility", posX: 10, posY: 80, unit: "kW", minThreshold: 0, maxThreshold: 15, model: "ZMPT101B-PRO", firmware: "v3.1.0" },
  { name: "Power Monitor A",    type: "ENERGY", location: "Sub Panel A",   floor: 1, zone: "Zone A", posX: 30, posY: 75, unit: "kW", minThreshold: 0, maxThreshold: 10, model: "ZMPT101B-PRO", firmware: "v3.1.0" },
  { name: "Power Monitor B",    type: "ENERGY", location: "Sub Panel B",   floor: 2, zone: "Zone B", posX: 60, posY: 80, unit: "kW", minThreshold: 0, maxThreshold: 10, model: "ZMPT101B-PRO", firmware: "v3.1.0" },
  { name: "Power Monitor Gen",  type: "ENERGY", location: "Generator",     floor: 1, zone: "Utility", posX: 90, posY: 85, unit: "kW", minThreshold: 0, maxThreshold: 20, model: "ZMPT101B-PRO", firmware: "v3.1.0" },

  // MOTION: 4 sensors
  { name: "Motion PIR Alpha", type: "MOTION", location: "Entrance",     floor: 1, zone: "Zone C", posX: 50, posY: 90, unit: "events/min", maxThreshold: 20, model: "HC-SR501-NET", firmware: "v1.2.7" },
  { name: "Motion PIR Beta",  type: "MOTION", location: "Parking",      floor: 0, zone: "External", posX: 50, posY: 10, unit: "events/min", maxThreshold: 30, model: "HC-SR501-NET", firmware: "v1.2.7" },
  { name: "Cam Zone A",       type: "MOTION", location: "Lab",          floor: 2, zone: "Zone B", posX: 35, posY: 60, unit: "events/min", maxThreshold: 15, model: "HC-SR501-NET", firmware: "v1.2.7" },
  { name: "Cam Zone B",       type: "MOTION", location: "Server Room",  floor: 1, zone: "Zone A", posX: 18, posY: 28, unit: "events/min", maxThreshold: 5,  model: "HC-SR501-NET", firmware: "v1.2.7" },
];

async function main() {
  console.log("🌱 Seeding STRATUM database...");

  // Admin user
  const password = await bcrypt.hash("Stratum@Admin1!", 12);
  await prisma.user.upsert({
    where: { email: "admin@stratum.io" },
    update: {},
    create: {
      email: "admin@stratum.io",
      password,
      displayName: "STRATUM Admin",
      role: "ADMIN",
    },
  });

  // Operator user
  const opPassword = await bcrypt.hash("Stratum@Op1!", 12);
  await prisma.user.upsert({
    where: { email: "operator@stratum.io" },
    update: {},
    create: {
      email: "operator@stratum.io",
      password: opPassword,
      displayName: "Operator One",
      role: "OPERATOR",
    },
  });

  // Sensors
  for (const sensor of SENSORS) {
    await prisma.sensor.upsert({
      where: { id: sensor.name },
      update: {},
      create: { ...sensor, id: undefined },
    });
  }

  console.log(`Seeded: 2 users, ${SENSORS.length} sensors`);
  console.log("Admin:    admin@stratum.io / Stratum@Admin1!");
  console.log("Operator: operator@stratum.io / Stratum@Op1!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
