import dayjs, { type Dayjs } from 'dayjs';
import dotenv from 'dotenv';
dotenv.config();

// TODO: Define an interface for the Coordinates object
interface Coordinates {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state: string;
}

// TODO: Define a class for the Weather object
class Weather {
  city: string;
  date: Dayjs | string;
  tempF: number;
  windSpeed: number;
  humidity: number;
  icon: string;
  iconDescription: string;
  constructor(
    city: string,
    date: Dayjs | string,
    tempF: number,
    windSpeed: number,
    humidity: number,
    icon: string,
    iconDescription: string
  ) {
    this.city = city;
    this.date = date;
    this.tempF = tempF;
    this.windSpeed = windSpeed;
    this.humidity = humidity;
    this.icon = icon;
    this.iconDescription = iconDescription;
  }
}

// TODO: Complete the WeatherService class
class WeatherService {
  
  private baseURL?: string;

  private apiKey?: 'db24c959309b59398c79f23f076964e8';

  private city = '';

  constructor() {
    this.baseURL = process.env.API_BASE_URL || '';

    this.apiKey = process.env.API_KEY || '';
  }
  // * Note: The following methods are here as a guide, but you are welcome to provide your own solution.
  // * Just keep in mind the getWeatherForCity method is being called in your
  // * 09-Servers-and-APIs/02-Challenge/Develop/server/src/routes/api/weatherRoutes.ts file
  
  // * the array of Weather objects you are returning ultimately goes to
  // * 09-Servers-and-APIs/02-Challenge/Develop/client/src/main.ts

  // TODO: Create fetchLocationData method
      private async fetchLocationData(query: string) {
        const APIKey = 'db24c959309b59398c79f23f076964e8';
        const response =  await fetch(`http://api.openweathermap.org/data/2.5/forecast?q=${this.city}&appid=${APIKey}`);
        const data = await response.json();
        console.log(data);
        return this.destructureLocationData(data[0]);
      }
  // TODO: Create destructureLocationData method
      private destructureLocationData(locationData: Coordinates): Coordinates {
        return{
        name: locationData.name,
        lat: locationData.lat,
        lon: locationData.lon,
        country: locationData.country,
        state: locationData.state || ''
      };
      }
  // TODO: Create buildGeocodeQuery method
      private buildGeocodeQuery(): string {
        const stateCode = '';
        const countryCode = '';
        return `http://api.openweathermap.org/geo/1.0/direct?q=${this.city},${stateCode},${countryCode}&limit={limit}&appid=${this.apiKey}`;
      };
  // TODO: Create buildWeatherQuery method
      private buildWeatherQuery(coordinates: Coordinates): string {
        return `http://api.openweathermap.org/geo/1.0/reverse?lat=${coordinates.lat}&lon=${coordinates.lon}&limit={limit}&appid=${this.apiKey}`;
       };
  // TODO: Create fetchAndDestructureLocationData method
      private async fetchAndDestructureLocationData(): Promise<Coordinates> {
        const response = await fetch(this.buildGeocodeQuery());
        const data = await response.json();
        return this.destructureLocationData(data[0]);
      };
  // TODO: Create fetchWeatherData method
      private async fetchWeatherData(coordinates: Coordinates) {
        const response = await fetch(this.buildWeatherQuery(coordinates));
        const data = await response.json();
        return data;
      }
  // TODO: Build parseCurrentWeather method
      private parseCurrentWeather(response: any): Weather {
        const weather = response.weather[0];
        const date = dayjs.unix(response.dt);
        return new Weather(
          this.city,
          date,
          response.main.temp,
          response.wind.speed,
          response.main.humidity,
          weather.icon,
          weather.description
        );
      }
  // TODO: Complete buildForecastArray method
      private buildForecastArray(currentWeather: Weather, weatherData: any[]) {
        const forecastArray: Weather[] = [];
        for (let i = 0; i < weatherData.length; i++) {
          const weather = weatherData[i];
          const date = dayjs.unix(weather.dt);
          forecastArray.push(
            new Weather(
              this.city,
              date,
              weather.main.temp,
              weather.wind.speed,
              weather.main.humidity,
              weather.weather[0].icon,
              weather.weather[0].description
            )
          );
        }
        return forecastArray;
      }
  // TODO: Complete getWeatherForCity method
       async getWeatherForCity(city: string) {
        this.city = city;
        const coordinates = await this.fetchAndDestructureLocationData();
        const weatherData = await this.fetchWeatherData(coordinates);
        const currentWeather = this.parseCurrentWeather(weatherData);
        const forecastArray = this.buildForecastArray(currentWeather, weatherData.list);
        return [currentWeather, ...forecastArray];
       }
}

export default new WeatherService();
