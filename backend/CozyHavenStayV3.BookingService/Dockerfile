FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 7103

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["CozyHavenStayV3.BookingService/CozyHavenStayV3.BookingService.csproj", "CozyHavenStayV3.BookingService/"]
RUN dotnet restore "CozyHavenStayV3.BookingService/CozyHavenStayV3.BookingService.csproj"
COPY . .
WORKDIR "/src/CozyHavenStayV3.BookingService"
RUN dotnet build "CozyHavenStayV3.BookingService.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "CozyHavenStayV3.BookingService.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "CozyHavenStayV3.BookingService.dll"]