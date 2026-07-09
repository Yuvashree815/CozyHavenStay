FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 7102

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["CozyHavenStayV3.HotelService/CozyHavenStayV3.HotelService.csproj", "CozyHavenStayV3.HotelService/"]
RUN dotnet restore "CozyHavenStayV3.HotelService/CozyHavenStayV3.HotelService.csproj"
COPY . .
WORKDIR "/src/CozyHavenStayV3.HotelService"
RUN dotnet build "CozyHavenStayV3.HotelService.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "CozyHavenStayV3.HotelService.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "CozyHavenStayV3.HotelService.dll"]