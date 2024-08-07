"use client";

import { Button } from "@/components/ui/button";
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { v4 as uuidv4 } from "uuid";
import { useStore } from "@/store";
import SearchIcon from "@/components/ui/search";
import Funnel from "@/components/ui/funnel";
import ArrowUp from "@/components/ui/arrow-up";
import Header from "@/components/navbar";
import { cn } from "@/lib/utils";
import { Inter } from "next/font/google";
import { getEmployees } from "@/lib/actions/get-employees";
import EmployeeProfile from "@/components/employee-profile";
import UpdateEmployee from "@/components/update-employee";
import { useAuthenticate } from "@/lib/hooks/useAuthenticate";
import SearchNotFound from "@/components/search-not-found";
import ListLoading from "@/components/list-loading";
import FilterOverlay from "@/components/filter-overlay";
import { filterByExperience } from "@/lib/functions";
import Cross from "@/components/ui/cross";
import ArrowDown from "@/components/ui/arrow-down";
import {
  Department,
  EmployeeDetails,
  Experience,
  Filters,
  Role,
} from "@/types";
import { departmentsObject, roleObject, experienceObject } from "@/constants";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });

const Home = () => {
  useAuthenticate();

  const [isLoading, setIsLoading] = useState(true);
  const [isFilter, setIsFilter] = useState(false);
  const [isViewDetails, setIsViewDetails] = useState(false);
  const [isUpdateEmployee, setIsUpdateEmployee] = useState(false);
  const [searchNotFound, setSearchNotFound] = useState(false);
  const [isRelievedChecked, setIsRelievedChecked] = useState(false);

  // Employee list states
  const [employees, setEmployees] = useState<EmployeeDetails[]>([]);
  const [searchedEmployees, setSearchedEmployees] = useState<EmployeeDetails[]>(
    []
  );
  const [filteredEmployees, setFilteredEmployees] = useState<EmployeeDetails[]>(
    []
  );

  // Sorting states
  const [isDateSorting, setIsDateSorting] = useState(false);
  const [dateSorting, setDateSorting] = useState<"asc" | "desc">("desc");
  const [alphabetSorting, setAlphabetSorting] = useState<"asc" | "desc">(
    "desc"
  );
  const [isAlphabeticalSorting, setIsAlphabeticalSorting] = useState(false);

  // Filter overlay states
  const [department, setDepartment] = useState<Department>(departmentsObject);
  const [role, setRole] = useState<Role>(roleObject);
  const [experience, setExperience] = useState<Experience>(experienceObject);
  // Filter state
  const [departmentFilters, setDepartmentFilters] = useState<string[]>([]);
  const [experienceFilters, setExperienceFilters] = useState<string[]>([]);
  const [roleFilters, setRoleFilters] = useState<string[]>([]);

  const employeesListRef = useRef<ReactNode | null>(null);

  const { setCurrentEmployee, isEmployeeFetching } = useStore();

  useEffect(() => {
    const initialLoad = async () => {
      try {
        const employees = await getEmployees();

        setEmployees(employees);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    initialLoad();
  }, [isEmployeeFetching]);

  const onApplyFilters = useCallback(
    (filters: Filters) => {
      const { departmentFilters, experienceFilters, roleFilters } = filters;

      if (isRelievedChecked) {
        let relievedEmployees;

        if (filteredEmployees.length) {
          relievedEmployees = filteredEmployees.filter(
            (employee) => employee.relieved
          );
        } else {
          relievedEmployees = employees.filter((employee) => employee.relieved);
        }

        if (!relievedEmployees.length) {
          setSearchNotFound(true);
        }

        setFilteredEmployees(relievedEmployees);
        setSearchedEmployees([]);
        setIsFilter(false);
        return;
      }

      if (
        !departmentFilters.length &&
        !experienceFilters.length &&
        !roleFilters.length
      ) {
        setFilteredEmployees([]);
        setSearchNotFound(false);
        setIsFilter(false);
        return;
      }

      if (departmentFilters.length) {
        const departmentFilteredEmployees = employees.filter((employee) =>
          departmentFilters.includes(employee.department)
        );

        setFilteredEmployees(departmentFilteredEmployees);

        if (!departmentFilteredEmployees.length) {
          setSearchNotFound(true);
        } else {
          setSearchNotFound(false);
        }
      }

      if (experienceFilters.length) {
        const experienceFilteredEmployees = filterByExperience(
          experienceFilters,
          employees
        );

        setFilteredEmployees(experienceFilteredEmployees);

        if (!experienceFilteredEmployees.length) {
          setSearchNotFound(true);
        } else {
          setSearchNotFound(false);
        }
      }

      if (roleFilters.length) {
        const roleFilteredEmployees = employees.filter((employee) =>
          roleFilters.includes(employee.currentRole)
        );

        setFilteredEmployees(roleFilteredEmployees);

        if (!roleFilteredEmployees.length) {
          setSearchNotFound(true);
        } else {
          setSearchNotFound(false);
        }
      }

      setSearchedEmployees([]);
      setIsFilter(false);
    },
    [employees, isRelievedChecked, filteredEmployees]
  );

  const viewDetails = useCallback(
    (employeeDetails: EmployeeDetails) => {
      setCurrentEmployee(employeeDetails);
      setIsViewDetails(true);
    },
    [setCurrentEmployee, setIsViewDetails]
  );

  const onDateSort = useCallback(
    (sortType: string) => {
      if (sortType === "asc") {
        if (filteredEmployees.length) {
          filteredEmployees.forEach(
            (item, index) => (item.originalIndex = index)
          );

          filteredEmployees.sort(
            (a, b) =>
              new Date(a.joiningDate).getTime() -
              new Date(b.joiningDate).getTime()
          );
        } else if (searchedEmployees.length) {
          searchedEmployees.forEach(
            (item, index) => (item.originalIndex = index)
          );

          searchedEmployees.sort(
            (a, b) =>
              new Date(a.joiningDate).getTime() -
              new Date(b.joiningDate).getTime()
          );
        } else {
          employees.forEach((item, index) => (item.originalIndex = index));

          employees.sort(
            (a, b) =>
              new Date(a.joiningDate).getTime() -
              new Date(b.joiningDate).getTime()
          );
        }
      } else {
        if (filteredEmployees.length) {
          filteredEmployees.forEach(
            (item, index) => (item.originalIndex = index)
          );

          filteredEmployees.sort(
            (a, b) =>
              new Date(b.joiningDate).getTime() -
              new Date(a.joiningDate).getTime()
          );
        } else if (searchedEmployees.length) {
          searchedEmployees.forEach(
            (item, index) => (item.originalIndex = index)
          );

          searchedEmployees.sort(
            (a, b) =>
              new Date(b.joiningDate).getTime() -
              new Date(a.joiningDate).getTime()
          );
        } else {
          employees.forEach((item, index) => (item.originalIndex = index));

          employees.sort(
            (a, b) =>
              new Date(b.joiningDate).getTime() -
              new Date(a.joiningDate).getTime()
          );
        }
      }
    },
    [employees, filteredEmployees, searchedEmployees]
  );

  const onAplhaSort = useCallback(
    (sortType: string) => {
      if (sortType === "asc") {
        if (filteredEmployees.length) {
          filteredEmployees.forEach(
            (item, index) => (item.originalIndex = index)
          );

          filteredEmployees.sort((a, b) => {
            if (a.name < b.name) return -1;
            if (a.name > b.name) return 1;
            return 0;
          });
        } else if (searchedEmployees.length) {
          searchedEmployees.forEach(
            (item, index) => (item.originalIndex = index)
          );

          searchedEmployees.sort((a, b) => {
            if (a.name < b.name) return -1;
            if (a.name > b.name) return 1;
            return 0;
          });
        } else {
          employees.forEach((item, index) => (item.originalIndex = index));

          employees.sort((a, b) => {
            if (a.name < b.name) return -1;
            if (a.name > b.name) return 1;
            return 0;
          });
        }
      } else {
        if (filteredEmployees.length) {
          filteredEmployees.forEach(
            (item, index) => (item.originalIndex = index)
          );

          filteredEmployees.sort((a, b) => {
            if (a.name < b.name) return 1;
            if (a.name > b.name) return -1;
            return 0;
          });
        } else if (searchedEmployees.length) {
          searchedEmployees.forEach(
            (item, index) => (item.originalIndex = index)
          );

          searchedEmployees.sort((a, b) => {
            if (a.name < b.name) return 1;
            if (a.name > b.name) return -1;
            return 0;
          });
        } else {
          employees.forEach((item, index) => (item.originalIndex = index));

          employees.sort((a, b) => {
            if (a.name < b.name) return 1;
            if (a.name > b.name) return -1;
            return 0;
          });
        }
      }
    },
    [employees, filteredEmployees, searchedEmployees]
  );

  const onSortRemove = useCallback(() => {
    if (filteredEmployees.length) {
      filteredEmployees.sort((a, b) => a.originalIndex! - b.originalIndex!);

      filteredEmployees.forEach((item) => delete item.originalIndex);
    } else if (searchedEmployees.length) {
      searchedEmployees.sort((a, b) => a.originalIndex! - b.originalIndex!);

      searchedEmployees.forEach((item) => delete item.originalIndex);
    } else {
      employees.sort((a, b) => a.originalIndex! - b.originalIndex!);

      employees.forEach((item) => delete item.originalIndex);
    }
  }, [filteredEmployees, employees, searchedEmployees]);

  if (searchNotFound) {
    employeesListRef.current = (
      <SearchNotFound
        setSearchNotFound={setSearchNotFound}
        setIsRelievedChecked={setIsRelievedChecked}
        setFilteredEmployees={setFilteredEmployees}
        setIsFilter={setIsFilter}
        setDepartment={setDepartment}
        setRole={setRole}
        setExperience={setExperience}
        setDepartmentFilters={setDepartmentFilters}
        setExperienceFilters={setExperienceFilters}
        setRoleFilters={setRoleFilters}
        font={inter}
      />
    );
  } else if (isLoading || employees.length || searchedEmployees.length) {
    let employeesList;

    if (searchedEmployees.length) {
      employeesList = searchedEmployees;
    } else if (filteredEmployees.length) {
      employeesList = filteredEmployees;
    } else {
      employeesList = employees;
    }

    employeesListRef.current = (
      <div className="max-lg:overflow-x-scroll [scrollbar-width:thin] w-full">
        <section className="rounded-lg w-[77.8rem] min-[1360px]:w-full overflow-y-auto max-h-[62vh] [scrollbar-width:thin]">
          <div className="text-[13px] text-[#000000B2] flex items-center">
            <div className="w-[2.9rem] text-[12px] py-[0.67rem] text-center bg-[#FCFCFC]">
              Slno.
            </div>
            <div className="w-[18.7rem] pl-[1rem] py-[0.67rem]">
              Employee name
            </div>
            <div className="py-[0.67rem] w-[10.5rem]">Employee ID</div>
            <div className="w-[17.5rem] py-[0.67rem]">Email Address</div>
            <div className="py-[0.67rem]">Department</div>
          </div>
          <hr />

          {isLoading
            ? Array.from({ length: 10 }).map((_, index) => (
                <ListLoading key={uuidv4()} index={index} />
              ))
            : employeesList.map((element, index) => (
                <>
                  <div
                    key={uuidv4()}
                    className={`text-base relative flex items-center ${
                      element.relieved ? "text-[#D42B2B]" : "text-black"
                    }`}
                  >
                    <div className="w-[2.9rem] text-[#000000B2] py-[1.17rem] text-center bg-[#FCFCFC] text-[12px]">
                      {index < 10 ? `0${index + 1}` : `${index + 1}`}
                    </div>
                    <div className="w-[18.7rem] pl-[1rem] py-[0.67rem]">
                      {element.name}
                    </div>
                    <div className="py-[0.67rem] w-[10.5rem]">
                      {element.employeeId}
                    </div>
                    <div className="py-[0.67rem] w-[17.5rem]">
                      {element.personalEmail}
                    </div>
                    <div className="py-[0.67rem] w-[20rem]">
                      {element.department}
                    </div>
                    <Button
                      className="bg-transparent px-2 h-auto py-2 rounded-sm hover:bg-transparent border text-black border-black"
                      type="button"
                      onClick={() => {
                        setSearchedEmployees([]);
                        setIsFilter(false);
                        setFilteredEmployees([]);
                        viewDetails(element);
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                  <hr />
                </>
              ))}
        </section>
      </div>
    );
  } else if (!employees.length && !searchedEmployees.length) {
    employeesListRef.current = (
      <section className="flex flex-col items-center justify-center h-[63.5vh]">
        {" "}
        <h1
          className={cn(
            "text-5xl text-[#000000B2] mb-6 text-center font-medium",
            inter.className
          )}
        >
          No employees found!
        </h1>
        <Link href="/add">
          <Button className={"bg-[#182CE3] hover:bg-[#182CE3]"}>
            Add Employee
          </Button>
        </Link>{" "}
      </section>
    );
  }

  if (isUpdateEmployee) {
    return (
      <UpdateEmployee
        setIsViewDetails={setIsViewDetails}
        setIsUpdateEmployee={setIsUpdateEmployee}
      />
    );
  }

  if (isViewDetails) {
    return (
      <EmployeeProfile
        setIsViewDetails={setIsViewDetails}
        setIsUpdateEmployee={setIsUpdateEmployee}
      />
    );
  }

  return (
    <div>
      {isFilter && (
        <FilterOverlay
          setSearchNotFound={setSearchNotFound}
          isRelievedChecked={isRelievedChecked}
          setIsRelievedChecked={setIsRelievedChecked}
          setFilteredEmployees={setFilteredEmployees}
          onApplyFilters={onApplyFilters}
          setIsFilter={setIsFilter}
          department={department}
          setDepartment={setDepartment}
          role={role}
          setRole={setRole}
          experience={experience}
          setExperience={setExperience}
          departmentFilters={departmentFilters}
          setDepartmentFilters={setDepartmentFilters}
          experienceFilters={experienceFilters}
          setExperienceFilters={setExperienceFilters}
          roleFilters={roleFilters}
          setRoleFilters={setRoleFilters}
        />
      )}

      <Header />
      <hr />
      <main className="px-7 sm:px-14">
        <div className="w-full flex lg:flex-row flex-col items-start sm:items-center bg-[#F7F7F7] rounded-lg px-7 py-[0.95rem] my-[1.57rem]">
          {" "}
          <form
            onSubmit={(e) => e.preventDefault()}
            className="sm:w-[26rem] w-full flex rounded-md border border-[#00000033] bg-white items-center py-4 lg:py-[0.78rem] px-5"
          >
            <SearchIcon />
            <input
              className={cn(
                "w-full text-[14px] outline-none placeholder:text-[#00000080] border-none ml-4 bg-transparent",
                inter.className
              )}
              type="search"
              onChange={(e) => {
                if (e.target.value === "") {
                  setSearchNotFound(false);
                  setSearchedEmployees([]);
                  return;
                }

                const lowerCaseValue = e.target.value.toLowerCase();

                const searchedEmployees = employees.filter(
                  (employee) =>
                    employee.name.toLowerCase().includes(lowerCaseValue) ||
                    employee.employeeId.toLowerCase().includes(lowerCaseValue)
                );

                if (!searchedEmployees.length) {
                  setSearchNotFound(true);
                }

                setSearchedEmployees(searchedEmployees);
                setFilteredEmployees([]);
              }}
              placeholder="Search Employee name, ID"
            />
          </form>
          <div className="flex sm:flex-row flex-col items-start sm:items-center max-sm:gap-y-3 mt-8 lg:mt-0 lg:ml-12">
            <Button
              type="button"
              onClick={() => setIsFilter(true)}
              className={cn(
                "flex items-center border text-black border-black bg-transparent hover:bg-transparent cursor-pointer rounded-lg text-[11px] px-3",
                inter.className
              )}
            >
              <Funnel />
              <span className="ml-2">Filter by</span>
            </Button>
            <span className="ml-5 mr-3 text-[#00000099] text-[12px]">
              Sort by:
            </span>
            {!isAlphabeticalSorting ? (
              <Button
                type="button"
                onClick={() => {
                  setIsAlphabeticalSorting(true);
                  onAplhaSort("asc");
                  setIsDateSorting(false);
                }}
                className="flex items-center border text-black border-black bg-transparent hover:bg-transparent rounded-lg text-[12px] px-2"
              >
                <ArrowUp />
                <span className="ml-2">Alphabetical</span>
              </Button>
            ) : alphabetSorting === "asc" ? (
              <Button
                type="button"
                onClick={() => {
                  setAlphabetSorting("desc");
                  onAplhaSort("desc");
                }}
                className="flex items-center text-black border-black bg-[#EAEAEA] hover:bg-[#EAEAEA] rounded-lg text-[12px] px-2 ml-3"
              >
                <ArrowDown />
                <span className="ml-2">Alphabetical</span>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsAlphabeticalSorting(false);
                    setAlphabetSorting("desc");
                    onSortRemove();
                  }}
                  className="pr-2 pl-4"
                >
                  <Cross stroke="#000000" />
                </div>
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => {
                  setAlphabetSorting("asc");
                  onAplhaSort("asc");
                }}
                className="flex items-center text-black border-black bg-[#EAEAEA] hover:bg-[#EAEAEA] rounded-lg text-[12px] px-2 ml-3"
              >
                <ArrowUp />
                <span className="ml-2">Alphabetical</span>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsAlphabeticalSorting(false);
                    setAlphabetSorting("desc");
                    onSortRemove();
                  }}
                  className="pr-2 pl-4"
                >
                  <Cross stroke="#000000" />
                </div>
              </Button>
            )}
            {/* ------------------------------------------------------------------------------ */}
            {!isDateSorting ? (
              <Button
                type="button"
                onClick={() => {
                  setIsAlphabeticalSorting(false);
                  setIsDateSorting(true);
                  onDateSort("asc");
                }}
                className="flex items-center border text-black border-black bg-transparent hover:bg-transparent rounded-lg text-[12px] px-2 sm:ml-3"
              >
                <ArrowUp />
                <span className="ml-2">Date added</span>
              </Button>
            ) : dateSorting === "asc" ? (
              <Button
                type="button"
                onClick={() => {
                  setDateSorting("desc");
                  onDateSort("desc");
                }}
                className="flex items-center text-black border-black bg-[#EAEAEA] hover:bg-[#EAEAEA] rounded-lg text-[12px] px-2 ml-3"
              >
                <ArrowDown />
                <span className="ml-2">Date added</span>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDateSorting(false);
                    setDateSorting("desc");
                    onSortRemove();
                  }}
                  className="pr-2 pl-4"
                >
                  <Cross stroke="#000000" />
                </div>
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => {
                  setDateSorting("asc");
                  onDateSort("asc");
                }}
                className="flex items-center text-black border-black bg-[#EAEAEA] hover:bg-[#EAEAEA] rounded-lg text-[12px] px-2 ml-3"
              >
                <ArrowUp />
                <span className="ml-2">Date added</span>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDateSorting(false);
                    setDateSorting("desc");
                    onSortRemove();
                  }}
                  className="pr-2 pl-4"
                >
                  <Cross stroke="#000000" />
                </div>
              </Button>
            )}
          </div>
        </div>

        {employeesListRef.current}
      </main>
    </div>
  );
};

export default Home;
